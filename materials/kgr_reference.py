"""Python reference for the multi-hop bench (assets/kgr-live.js). Written independently of the JS
engine; must agree with it BY VALUE (materials/compare-ladder.py).

Graph side: a small Cypher-like pattern matcher over the typed edges (relationship uniqueness per
path, as in Cypher). Chunk side: templated sentences per person, F facts per chunk, BM25 with
Lucene's IDF, k1 = 1.2, b = 0.75, deterministic tie-break by chunk index. A question counts as
found by chunks only if every fact its answer needs sits in the top k chunks.

Usage:
  python3 materials/kgr_reference.py out.json          # every scenario, for compare-ladder.py
  python3 materials/kgr_reference.py --canon           # print the ladder canon
"""
import json, math, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SAMPLE = os.path.join(HERE, "..", "assets", "kgr-sample.js")
LIVE = os.path.join(HERE, "..", "assets", "kgr-live.js")

STOP = set("a an the of in at for to was were which who what where did do does is are and or by "
           "with on as from that s whose any also both".split())
K1, B = 1.2, 0.75
LABELS = ["Person", "Institution", "Country", "Prize"]


def load_sample():
    s = open(SAMPLE, encoding="utf-8").read()
    return json.loads(s[s.index("var D = ") + 8: s.index(";\nif (typeof")])


def load_spec():
    """QUESTIONS, LADDER, LEVERS live in kgr-live.js as one JSON block between markers."""
    s = open(LIVE, encoding="utf-8").read()
    a = s.index("/*SPEC*/") + len("/*SPEC*/")
    b = s.index("/*END-SPEC*/")
    return json.loads(s[a:b].strip().rstrip(";"))


def tokens(text):
    return [t for t in re.split(r"[^a-z0-9]+", text.lower()) if t]


def fl(x):
    return math.floor(x)


class Engine:
    def __init__(self, D):
        self.D = D
        self.N = len(D["k"])
        self.edges = []  # (type, from, to, year or None)
        for t in D["etypes"]:
            for e in D["e"][t]:
                self.edges.append((t, e[0], e[1], e[2] if len(e) > 2 else None))
        self.byname = {}
        for i, nm in enumerate(D["n"]):
            self.byname.setdefault(nm, []).append(i)
        self.out = [[] for _ in range(self.N)]
        self.inc = [[] for _ in range(self.N)]
        for ei, (t, a, b, y) in enumerate(self.edges):
            self.out[a].append(ei)
            self.inc[b].append(ei)
        self.facts_of = [[] for _ in range(self.N)]  # person -> [(edge id, sentence)]
        self._person_facts()
        self.cache = {}

    # ---------- facts and chunks ----------
    def sentence(self, ei, side):
        t, a, b, y = self.edges[ei]
        n = self.D["n"]
        if t == "WON":
            return "%s won the %s in %d." % (n[a], n[b], y)
        if t == "EDUCATED_AT":
            return "%s was educated at %s." % (n[a], n[b])
        if t == "EMPLOYED_BY":
            return "%s worked for %s." % (n[a], n[b])
        if t == "CITIZEN_OF":
            return "%s was a citizen of %s." % (n[a], n[b])
        if t == "ADVISED":
            if side == "student":
                return "%s's doctoral advisor was %s." % (n[b], n[a])
            return "%s was the doctoral advisor of %s." % (n[a], n[b])
        raise ValueError(t)

    def _person_facts(self):
        order = ["WON", "ADVISED_S", "ADVISED_A", "EDUCATED_AT", "EMPLOYED_BY", "CITIZEN_OF"]
        for p in range(self.N):
            if self.D["k"][p] != 0:
                continue
            buckets = {o: [] for o in order}
            for ei in self.out[p]:
                t = self.edges[ei][0]
                buckets["ADVISED_A" if t == "ADVISED" else t].append(ei)
            for ei in self.inc[p]:
                if self.edges[ei][0] == "ADVISED":
                    buckets["ADVISED_S"].append(ei)
            for o in order:
                for ei in sorted(buckets[o]):
                    side = "student" if o == "ADVISED_S" else "advisor"
                    self.facts_of[p].append((ei, self.sentence(ei, side)))

    def chunks(self, F):
        if F in self.cache:
            return self.cache[F]
        ch = []  # dict(text, facts, toks, words)
        for p in range(self.N):
            fs = self.facts_of[p]
            for i in range(0, len(fs), F):
                part = fs[i:i + F]
                text = " ".join(s for _, s in part)
                toks = tokens(text)
                ch.append({"facts": [e for e, _ in part], "words": len(toks),
                           "terms": [t for t in toks if t not in STOP]})
        df = {}
        for c in ch:
            tf = {}
            for t in c["terms"]:
                tf[t] = tf.get(t, 0) + 1
            c["tf"] = tf
            c["dl"] = len(c["terms"])
            for t in tf:
                df[t] = df.get(t, 0) + 1
        total = 0
        for c in ch:
            total += c["dl"]
        avgdl = total / len(ch)
        fact_chunks = {}
        for ci, c in enumerate(ch):
            for e in c["facts"]:
                fact_chunks.setdefault(e, []).append(ci)
        idx = {"ch": ch, "df": df, "N": len(ch), "avgdl": avgdl, "fact_chunks": fact_chunks}
        self.cache[F] = idx
        return idx

    def rank(self, F, query):
        ck = ("rank", F, query)
        if ck in self.cache:
            return self.cache[ck]
        self.cache[ck] = self._rank(F, query)
        return self.cache[ck]

    def _rank(self, F, query):
        idx = self.chunks(F)
        q = sorted(set(t for t in tokens(query) if t not in STOP))
        N, avgdl = idx["N"], idx["avgdl"]
        scores = []
        for ci, c in enumerate(idx["ch"]):
            s = 0.0
            for t in q:
                tf = c["tf"].get(t, 0)
                if tf == 0:
                    continue
                n = idx["df"][t]
                idf = math.log(1 + (N - n + 0.5) / (n + 0.5))
                s += idf * (tf * (K1 + 1)) / (tf + K1 * (1 - B + B * c["dl"] / avgdl))
            scores.append(fl(s * 1e9 + 0.5) / 1e9)
        order = sorted(range(N), key=lambda i: (-scores[i], i))
        rank_of = [0] * N
        for r, ci in enumerate(order):
            rank_of[ci] = r + 1
        return order, rank_of

    # ---------- the pattern language ----------
    def parse(self, src):
        m = re.match(r"^\s*MATCH\s+(.*?)\s+RETURN\s+(\w+)\s*$", src)
        if not m:
            raise ValueError("pattern must be MATCH ... RETURN var")
        body, ret = m.group(1), m.group(2)
        tok = re.compile(r"\(\s*(\w*)\s*(?::\s*(\w+))?\s*(?:\{\s*(\w+)\s*:\s*\"([^\"]*)\"\s*\})?\s*\)"
                         r"|(<-)?\[\s*(?::\s*(\w+))?\s*(\*\s*(\d*)\s*(?:\.\.\s*(\d*))?)?\s*\](->|-)"
                         r"|(-)")
        pos, parts = 0, []
        while pos < len(body):
            if body[pos].isspace():
                pos += 1
                continue
            mm = tok.match(body, pos)
            if not mm:
                raise ValueError("cannot read pattern near: " + body[pos:pos + 20])
            pos = mm.end()
            if mm.group(0).startswith("("):
                parts.append({"node": True, "var": mm.group(1) or None, "label": mm.group(2),
                              "key": mm.group(3), "val": mm.group(4)})
            elif mm.group(11):
                continue  # the leading '-' of -[...]->
            else:
                left, right = mm.group(5), mm.group(10)
                if left and right == "->":
                    raise ValueError("a relationship cannot point both ways")
                if not left and right != "->":
                    raise ValueError("undirected relationships are not in this subset")
                lo, hi = 1, 1
                if mm.group(7):
                    a, bb = mm.group(8), mm.group(9)
                    has_range = ".." in mm.group(7)
                    lo = int(a) if a else 1
                    hi = int(bb) if bb else (lo if (a and not has_range) else 4)
                    if not has_range and not a:
                        lo, hi = 1, 4
                parts.append({"node": False, "type": mm.group(6), "dir": "in" if left else "out",
                              "lo": lo, "hi": hi})
        nodes = parts[0::2]
        rels = parts[1::2]
        if not all(p["node"] for p in nodes) or not all(not r["node"] for r in rels) or len(nodes) != len(rels) + 1:
            raise ValueError("pattern must alternate (node) -[rel]- (node)")
        vars_ = [p["var"] for p in nodes]
        if ret not in vars_:
            raise ValueError("RETURN names a variable the pattern does not bind")
        return {"nodes": nodes, "rels": rels, "ret": vars_.index(ret)}

    def node_ok(self, i, p):
        if p["label"] and LABELS[self.D["k"][i]] != p["label"]:
            return False
        if p["key"] == "name" and self.D["n"][i] != p["val"]:
            return False
        if p["key"] == "qid" and "Q%d" % self.D["q"][i] != p["val"]:
            return False
        return True

    def match(self, pat, drop=None, hop_limit=99):
        nodes, rels = pat["nodes"], pat["rels"]
        p0 = nodes[0]
        if p0["key"] == "name":
            starts = [i for i in self.byname.get(p0["val"], []) if self.node_ok(i, p0)]
        else:
            starts = [i for i in range(self.N) if self.node_ok(i, p0)]
        answers, evidence = set(), set()
        stats = {"paths": 0}

        def step_edges(n, rel):
            res = []
            lst = self.out[n] if rel["dir"] == "out" else self.inc[n]
            for ei in lst:
                t = self.edges[ei][0]
                if rel["type"] and t != rel["type"]:
                    continue
                if drop and t == drop:
                    continue
                res.append((ei, self.edges[ei][2] if rel["dir"] == "out" else self.edges[ei][1]))
            return res

        def walk(ri, n, used, path, bound, hops):
            if ri == len(rels):
                stats["paths"] += 1
                answers.add(bound[pat["ret"]])
                evidence.update(path)
                return
            rel = rels[ri]

            def seg(n2, depth, used2, path2):
                if depth >= rel["lo"] and self.node_ok(n2, nodes[ri + 1]):
                    walk(ri + 1, n2, used2, path2, bound + [n2], hops + depth)
                if depth == rel["hi"] or hops + depth >= hop_limit:
                    return
                for ei, m in step_edges(n2, rel):
                    if ei in used2:
                        continue
                    seg(m, depth + 1, used2 | {ei}, path2 + [ei])

            seg(n, 0, used, path)

        for s in starts:
            walk(0, s, frozenset(), [], [s], 0)
        return sorted(answers), sorted(evidence), stats["paths"]

    def hops_of(self, pat):
        return sum(r["hi"] for r in pat["rels"])


class Algo:
    """Mirror of makeAlgo in kgr-live.js: undirected views, Brandes betweenness, 100-iteration
    PageRank, deterministic asynchronous label propagation, BFS shortest path."""

    def __init__(self, E):
        self.E, self.cache = E, {}

    def view(self, mode):
        if ("v", mode) in self.cache:
            return self.cache[("v", mode)]
        nb = {}
        for (t, a, b, y) in self.E.edges:
            if mode == "advisor" and t != "ADVISED":
                continue
            if a == b:
                continue
            nb.setdefault(a, set()).add(b)
            nb.setdefault(b, set()).add(a)
        keep = [i for i in range(self.E.N) if i in nb]
        id_of = {g: j for j, g in enumerate(keep)}
        adj = [[id_of[x] for x in sorted(nb[g])] for g in keep]
        m = sum(len(a) for a in adj) // 2
        V = {"nodes": keep, "adj": adj, "n": len(keep), "m": m, "id_of": id_of}
        self.cache[("v", mode)] = V
        return V

    def degree(self, mode):
        return [len(a) for a in self.view(mode)["adj"]]

    def betweenness(self, mode):
        if ("b", mode) in self.cache:
            return self.cache[("b", mode)]
        V = self.view(mode)
        n, adj = V["n"], V["adj"]
        bc = [0.0] * n
        for s in range(n):
            sigma = [0.0] * n
            dist = [-1] * n
            delta = [0.0] * n
            preds = [[] for _ in range(n)]
            sigma[s] = 1.0
            dist[s] = 0
            stack, queue, qh = [], [s], 0
            while qh < len(queue):
                v = queue[qh]
                qh += 1
                stack.append(v)
                for w in adj[v]:
                    if dist[w] < 0:
                        dist[w] = dist[v] + 1
                        queue.append(w)
                    if dist[w] == dist[v] + 1:
                        sigma[w] += sigma[v]
                        preds[w].append(v)
            while stack:
                w = stack.pop()
                for v in preds[w]:
                    delta[v] += (sigma[v] / sigma[w]) * (1 + delta[w])
                if w != s:
                    bc[w] += delta[w]
        scale = 1 / ((n - 1) * (n - 2)) if n > 2 else 1
        out = [x * scale for x in bc]
        self.cache[("b", mode)] = out
        return out

    def pagerank(self, mode):
        if ("p", mode) in self.cache:
            return self.cache[("p", mode)]
        V = self.view(mode)
        n, adj = V["n"], V["adj"]
        pr = [1 / n] * n
        for _ in range(100):
            nx_ = [0.0] * n
            for v in range(n):
                s = 0.0
                for u in adj[v]:
                    s += pr[u] / len(adj[u])
                nx_[v] = (1 - 0.85) / n + 0.85 * s
            pr = nx_
        self.cache[("p", mode)] = pr
        return pr

    def communities(self, mode):
        if ("c", mode) in self.cache:
            return self.cache[("c", mode)]
        V = self.view(mode)
        n, adj = V["n"], V["adj"]
        lab = list(range(n))
        rounds, changed = 0, True
        while changed and rounds < 30:
            changed = False
            rounds += 1
            for v in range(n):
                if not adj[v]:
                    continue
                cnt = {}
                for u in adj[v]:
                    cnt[lab[u]] = cnt.get(lab[u], 0) + 1
                best, best_c = -1, 0
                for l, c in cnt.items():
                    if c > best_c or (c == best_c and l < best):
                        best, best_c = l, c
                if best != lab[v]:
                    lab[v] = best
                    changed = True
        groups = {}
        for v, l in enumerate(lab):
            groups.setdefault(l, []).append(v)
        lst = sorted(groups.values(), key=lambda g: (-len(g), g[0]))
        out = {"rounds": rounds, "groups": lst, "converged": not changed}
        self.cache[("c", mode)] = out
        return out

    def path(self, mode, a, b):
        V = self.view(mode)
        s, t = V["id_of"].get(a), V["id_of"].get(b)
        if s is None or t is None:
            return None
        par = [-2] * V["n"]
        par[s] = -1
        q, h = [s], 0
        while h < len(q):
            v = q[h]
            h += 1
            if v == t:
                break
            for w in V["adj"][v]:
                if par[w] == -2:
                    par[w] = v
                    q.append(w)
        if par[t] == -2:
            return []
        p, c = [], t
        while c != -1:
            p.append(V["nodes"][c])
            c = par[c]
        return p[::-1]

    def top(self, mode, scores, k):
        V = self.view(mode)
        idx = sorted(range(len(scores)), key=lambda i: (-scores[i], V["nodes"][i]))
        return [(V["nodes"][i], scores[i]) for i in idx[:k]]


def algo_canon(E, A):
    n = E.D["n"]
    out = {}
    for mode in ("advisor", "full"):
        V = A.view(mode)
        o = {"n": V["n"], "m": V["m"]}
        for meas in ("degree", "betweenness", "pagerank"):
            sc = getattr(A, meas)(mode)
            o[meas] = [[n[g], round(v, 9)] for g, v in A.top(mode, sc, 10)]
        c = A.communities(mode)
        deg = A.degree(mode)
        o["communities"] = {"count": len(c["groups"]), "rounds": c["rounds"], "converged": c["converged"],
                            "top5": [[len(g), [n[V["nodes"][v]] for v in sorted(g, key=lambda v: (-deg[v], v))[:3]]]
                                     for g in c["groups"][:5]]}
        o["path"] = [n[x] for x in (A.path(mode, E.byname["Esther Duflo"][0], E.byname["Paul Samuelson"][0]) or [])]
        out[mode] = o
    return out


def run(E, spec, st):
    """One bench state -> per-question results for BOTH methods, plus aggregates."""
    k, F, hop_limit, drop = st["k"], st["F"], st["hop"], st["drop"] or None
    idx = E.chunks(F)
    rows = []
    for q in spec["questions"]:
        pat = E.parse(q["cypher"])
        tk = ("m", q["id"], None, 99)
        if tk not in E.cache:
            E.cache[tk] = E.match(pat)
        truth, ev, _ = E.cache[tk]
        gk = ("m", q["id"], drop, hop_limit)
        if gk not in E.cache:
            E.cache[gk] = E.match(pat, drop=drop, hop_limit=hop_limit)
        got = E.cache[gk][0]
        order, rank_of = E.rank(F, q["text"])
        need = 0
        for e in ev:
            best = min(rank_of[ci] for ci in idx["fact_chunks"][e])
            need = max(need, best)
        words = 0
        for ci in order[:k]:
            words += idx["ch"][ci]["words"]
        rows.append({"id": q["id"], "hop": q["hop"], "truth": len(truth), "facts": len(ev),
                     "kNeed": need, "chunkFound": need <= k, "ctxWords": words,
                     "graphGot": len(got), "graphFound": got == truth})
    agg = {}
    for h in (1, 2, 3, 4):
        rs = [r for r in rows if r["hop"] == h]
        agg[str(h)] = {"n": len(rs), "chunk": sum(r["chunkFound"] for r in rs),
                       "graph": sum(r["graphFound"] for r in rs)}
    n = len(rows)
    tot_words = 0
    for r in rows:
        tot_words += r["ctxWords"]
    tot_facts = 0
    for r in rows:
        tot_facts += r["facts"]
    out = {"rows": rows, "byHop": agg, "n": n,
           "chunkFound": sum(r["chunkFound"] for r in rows),
           "graphFound": sum(r["graphFound"] for r in rows),
           "chunkPct": fl((200 * sum(r["chunkFound"] for r in rows) + n) / (2 * n)),
           "graphPct": fl((200 * sum(r["graphFound"] for r in rows) + n) / (2 * n)),
           "avgCtxWords": fl(tot_words / n + 0.5), "avgFacts": fl(tot_facts * 10 / n + 0.5) / 10,
           "chunks": idx["N"]}
    return out


def spec_global():
    s = open(LIVE, encoding="utf-8").read()
    a = s.index('var GLOBAL_Q = "') + len('var GLOBAL_Q = "')
    return json.loads('"' + s[a:s.index('";', a)] + '"')


def scenarios(spec):
    lv = spec["levers"]
    for k in lv["k"]:
        for F in lv["F"]:
            for h in lv["hop"]:
                for d in lv["drop"]:
                    yield {"k": k, "F": F, "hop": h, "drop": d}


def key(st):
    return "k%d|F%d|h%d|%s" % (st["k"], st["F"], st["hop"], st["drop"] or "none")


if __name__ == "__main__":
    D = load_sample()
    spec = load_spec()
    E = Engine(D)
    if len(sys.argv) > 1 and sys.argv[1] == "--canon":
        for r in spec["ladder"]:
            o = run(E, spec, r["s"])
            print(r["id"], r["label"], "chunk %d/%d (%d%%)" % (o["chunkFound"], o["n"], o["chunkPct"]),
                  "graph %d/%d (%d%%)" % (o["graphFound"], o["n"], o["graphPct"]),
                  "byHop", {h: (v["chunk"], v["graph"]) for h, v in o["byHop"].items()},
                  "ctxWords", o["avgCtxWords"], "facts", o["avgFacts"], "chunks", o["chunks"])
        sys.exit(0)
    if len(sys.argv) > 1 and sys.argv[1] == "--algo":
        print(json.dumps(algo_canon(E, Algo(E)), indent=1, ensure_ascii=False))
        sys.exit(0)
    res = {}
    for st in scenarios(spec):
        res[key(st)] = run(E, spec, st)
    res["algo"] = algo_canon(E, Algo(E))
    gpat = E.parse(spec_global())
    ga, gev, gp = E.match(gpat)
    res["global"] = {"rows": len(ga), "facts": len(gev), "paths": gp}
    json.dump(res, open(sys.argv[1], "w"), sort_keys=True)
    print("python scenarios", len(res))
