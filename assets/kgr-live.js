/* kgr-live.js - the multi-hop lab (learn-knowledge-graphs-with-phoebe).
   Data: assets/kgr-sample.js, a Wikidata (CC0) extract around Nobel laureates, fetched 2026-11-16.
   Every question is answered two ways, for real, in your browser:
     graph  - a small Cypher-like pattern matcher over the typed edges (a documented subset)
     chunks - BM25 top-k over sentences generated from the same facts (Lucene IDF, k1 1.2, b 0.75);
              a question counts as found only if every fact its answer needs is in the top k.
   Also: a query box (.kgr-query) and graph algorithms (.kgr-algo) on the same graph.
   materials/kgr_reference.py computes the same numbers; materials/compare-ladder.py checks them.
   No dependencies. Works in the browser and in node (module.exports). */
(function (root) {
  "use strict";

  var SPEC = /*SPEC*/{
    "questions": [
      {"id": "q01", "hop": 1, "text": "Who was Max Born's doctoral advisor?", "cypher": "MATCH (p:Person {name:\"Max Born\"})<-[:ADVISED]-(a) RETURN a"},
      {"id": "q02", "hop": 1, "text": "Which Nobel Prize did Dorothy Hodgkin win?", "cypher": "MATCH (p:Person {name:\"Dorothy Hodgkin\"})-[:WON]->(z:Prize) RETURN z"},
      {"id": "q03", "hop": 1, "text": "Who were Max Planck's doctoral students?", "cypher": "MATCH (p:Person {name:\"Max Planck\"})-[:ADVISED]->(s) RETURN s"},
      {"id": "q04", "hop": 1, "text": "Which country was Abdus Salam a citizen of?", "cypher": "MATCH (p:Person {name:\"Abdus Salam\"})-[:CITIZEN_OF]->(c) RETURN c"},
      {"id": "q05", "hop": 1, "text": "Who employed Esther Duflo?", "cypher": "MATCH (p:Person {name:\"Esther Duflo\"})-[:EMPLOYED_BY]->(o) RETURN o"},
      {"id": "q06", "hop": 1, "text": "Where was Niels Bohr educated?", "cypher": "MATCH (p:Person {name:\"Niels Bohr\"})-[:EDUCATED_AT]->(o) RETURN o"},
      {"id": "q07", "hop": 2, "text": "Which Nobel Prize did Max Delbrück's doctoral advisor win?", "cypher": "MATCH (p:Person {name:\"Max Delbrück\"})<-[:ADVISED]-(a)-[:WON]->(z:Prize) RETURN z"},
      {"id": "q08", "hop": 2, "text": "Which of Max Planck's doctoral students won a Nobel Prize?", "cypher": "MATCH (p:Person {name:\"Max Planck\"})-[:ADVISED]->(s)-[:WON]->(z:Prize) RETURN s"},
      {"id": "q09", "hop": 2, "text": "Where was Werner Heisenberg's doctoral advisor educated?", "cypher": "MATCH (p:Person {name:\"Werner Heisenberg\"})<-[:ADVISED]-(a)-[:EDUCATED_AT]->(o) RETURN o"},
      {"id": "q10", "hop": 2, "text": "Which of Linus Pauling's doctoral students won a Nobel Prize?", "cypher": "MATCH (p:Person {name:\"Linus Pauling\"})-[:ADVISED]->(s)-[:WON]->(z:Prize) RETURN s"},
      {"id": "q11", "hop": 2, "text": "Which country was Niels Bohr's doctoral advisor a citizen of?", "cypher": "MATCH (p:Person {name:\"Niels Bohr\"})<-[:ADVISED]-(a)-[:CITIZEN_OF]->(c) RETURN c"},
      {"id": "q12", "hop": 2, "text": "Which Nobel Prize did Carol Greider's doctoral advisor win?", "cypher": "MATCH (p:Person {name:\"Carol Greider\"})<-[:ADVISED]-(a)-[:WON]->(z:Prize) RETURN z"},
      {"id": "q13", "hop": 3, "text": "Which Nobel Prize did the doctoral advisor of Ernest Rutherford's doctoral advisor win?", "cypher": "MATCH (p:Person {name:\"Ernest Rutherford\"})<-[:ADVISED*2]-(b)-[:WON]->(z:Prize) RETURN z"},
      {"id": "q14", "hop": 3, "text": "Which Nobel Prize did the doctoral advisor of Joseph Stiglitz's doctoral advisor win?", "cypher": "MATCH (p:Person {name:\"Joseph Stiglitz\"})<-[:ADVISED*2]-(b)-[:WON]->(z:Prize) RETURN z"},
      {"id": "q15", "hop": 3, "text": "Which Nobel Prize did the doctoral advisor of Abhijit Banerjee's doctoral advisor win?", "cypher": "MATCH (p:Person {name:\"Abhijit Banerjee\"})<-[:ADVISED*2]-(b)-[:WON]->(z:Prize) RETURN z"},
      {"id": "q16", "hop": 3, "text": "Who was the doctoral advisor of the doctoral advisor of Jean Tirole's doctoral advisor?", "cypher": "MATCH (p:Person {name:\"Jean Tirole\"})<-[:ADVISED*3]-(b) RETURN b"},
      {"id": "q17", "hop": 3, "text": "Which doctoral students of Enrico Fermi's doctoral students won a Nobel Prize?", "cypher": "MATCH (p:Person {name:\"Enrico Fermi\"})-[:ADVISED*2]->(x)-[:WON]->(z:Prize) RETURN x"},
      {"id": "q18", "hop": 3, "text": "Which country was the doctoral advisor of Serge Haroche's doctoral advisor a citizen of?", "cypher": "MATCH (p:Person {name:\"Serge Haroche\"})<-[:ADVISED*2]-(b)-[:CITIZEN_OF]->(c) RETURN c"},
      {"id": "q19", "hop": 4, "text": "Which Nobel Prize did the doctoral advisor of the doctoral advisor of Gary Ruvkun's doctoral advisor win?", "cypher": "MATCH (p:Person {name:\"Gary Ruvkun\"})<-[:ADVISED*3]-(b)-[:WON]->(z:Prize) RETURN z"},
      {"id": "q20", "hop": 4, "text": "Which Nobel Prize did the doctoral advisor of the doctoral advisor of Esther Duflo's doctoral advisor win?", "cypher": "MATCH (p:Person {name:\"Esther Duflo\"})<-[:ADVISED*3]-(b)-[:WON]->(z:Prize) RETURN z"},
      {"id": "q21", "hop": 4, "text": "Which Nobel Prize did the doctoral advisor of the doctoral advisor of David Julius's doctoral advisor win?", "cypher": "MATCH (p:Person {name:\"David Julius\"})<-[:ADVISED*3]-(b)-[:WON]->(z:Prize) RETURN z"},
      {"id": "q22", "hop": 4, "text": "Which Nobel Prize did the doctoral advisor of the doctoral advisor of Robert J. Shiller's doctoral advisor win?", "cypher": "MATCH (p:Person {name:\"Robert J. Shiller\"})<-[:ADVISED*3]-(b)-[:WON]->(z:Prize) RETURN z"},
      {"id": "q23", "hop": 4, "text": "Which Nobel Prize did the doctoral advisor of the doctoral advisor of Francis Crick's doctoral advisor win?", "cypher": "MATCH (p:Person {name:\"Francis Crick\"})<-[:ADVISED*3]-(b)-[:WON]->(z:Prize) RETURN z"},
      {"id": "q24", "hop": 4, "text": "Which Nobel Prize did the doctoral advisor of the doctoral advisor of Donald Arthur Glaser's doctoral advisor win?", "cypher": "MATCH (p:Person {name:\"Donald Arthur Glaser\"})<-[:ADVISED*3]-(b)-[:WON]->(z:Prize) RETURN z"}
    ],
    "levers": {"k": [3, 10, 30, 100], "F": [1, 2, 4, 8], "hop": [1, 2, 3, 4], "drop": ["", "ADVISED", "EDUCATED_AT", "EMPLOYED_BY", "WON", "CITIZEN_OF"]},
    "ladder": [
      {"id": "r1", "label": "k = 3 chunks", "focus": "chunk", "s": {"k": 3, "F": 2, "hop": 4, "drop": ""}},
      {"id": "r2", "label": "k = 10 chunks", "focus": "chunk", "s": {"k": 10, "F": 2, "hop": 4, "drop": ""}},
      {"id": "r3", "label": "k = 30 chunks", "focus": "chunk", "s": {"k": 30, "F": 2, "hop": 4, "drop": ""}},
      {"id": "r4", "label": "Graph, 1 hop", "focus": "graph", "s": {"k": 10, "F": 2, "hop": 1, "drop": ""}},
      {"id": "r5", "label": "Graph, full depth", "focus": "graph", "s": {"k": 10, "F": 2, "hop": 4, "drop": ""}},
      {"id": "t1", "label": "Graph, advisor edges never extracted", "focus": "graph", "trap": true, "s": {"k": 10, "F": 2, "hop": 4, "drop": "ADVISED"}}
    ]
  }/*END-SPEC*/;

  var STOP = {};
  "a an the of in at for to was were which who what where did do does is are and or by with on as from that s whose any also both"
    .split(" ").forEach(function (w) { STOP[w] = true; });
  var K1 = 1.2, B = 0.75;
  var LABELS = ["Person", "Institution", "Country", "Prize"];
  var GLOBAL_Q = "MATCH (z1:Prize)<-[:WON]-(a:Person)-[:ADVISED]->(s:Person)-[:WON]->(z2:Prize) RETURN s";

  function tokens(text) { return text.toLowerCase().split(/[^a-z0-9]+/).filter(function (t) { return t.length > 0; }); }
  function fl(x) { return Math.floor(x); }

  function makeEngine(D) {
    var N = D.k.length;
    var edges = [];
    D.etypes.forEach(function (t) {
      D.e[t].forEach(function (e) { edges.push([t, e[0], e[1], e.length > 2 ? e[2] : null]); });
    });
    var byname = {};
    D.n.forEach(function (nm, i) { (byname[nm] = byname[nm] || []).push(i); });
    var out = [], inc = [], i;
    for (i = 0; i < N; i++) { out.push([]); inc.push([]); }
    edges.forEach(function (e, ei) { out[e[1]].push(ei); inc[e[2]].push(ei); });
    var cache = {};

    function sentence(ei, side) {
      var e = edges[ei], t = e[0], a = e[1], b = e[2], n = D.n;
      if (t === "WON") return n[a] + " won the " + n[b] + " in " + e[3] + ".";
      if (t === "EDUCATED_AT") return n[a] + " was educated at " + n[b] + ".";
      if (t === "EMPLOYED_BY") return n[a] + " worked for " + n[b] + ".";
      if (t === "CITIZEN_OF") return n[a] + " was a citizen of " + n[b] + ".";
      if (side === "student") return n[b] + "'s doctoral advisor was " + n[a] + ".";
      return n[a] + " was the doctoral advisor of " + n[b] + ".";
    }

    var factsOf = [];
    (function () {
      var order = ["WON", "ADVISED_S", "ADVISED_A", "EDUCATED_AT", "EMPLOYED_BY", "CITIZEN_OF"];
      for (var p = 0; p < N; p++) {
        factsOf.push([]);
        if (D.k[p] !== 0) continue;
        var bk = {};
        order.forEach(function (o) { bk[o] = []; });
        out[p].forEach(function (ei) { var t = edges[ei][0]; bk[t === "ADVISED" ? "ADVISED_A" : t].push(ei); });
        inc[p].forEach(function (ei) { if (edges[ei][0] === "ADVISED") bk.ADVISED_S.push(ei); });
        order.forEach(function (o) {
          bk[o].sort(function (x, y) { return x - y; }).forEach(function (ei) {
            factsOf[p].push([ei, sentence(ei, o === "ADVISED_S" ? "student" : "advisor")]);
          });
        });
      }
    })();

    function chunks(F) {
      var key = "c" + F;
      if (cache[key]) return cache[key];
      var ch = [];
      for (var p = 0; p < N; p++) {
        var fs = factsOf[p];
        for (var j = 0; j < fs.length; j += F) {
          var part = fs.slice(j, j + F);
          var text = part.map(function (x) { return x[1]; }).join(" ");
          var toks = tokens(text);
          ch.push({ person: p, text: text, facts: part.map(function (x) { return x[0]; }), words: toks.length,
                    terms: toks.filter(function (t) { return !STOP[t]; }) });
        }
      }
      var df = {}, total = 0;
      ch.forEach(function (c) {
        var tf = {};
        c.terms.forEach(function (t) { tf[t] = (tf[t] || 0) + 1; });
        c.tf = tf; c.dl = c.terms.length;
        Object.keys(tf).forEach(function (t) { df[t] = (df[t] || 0) + 1; });
      });
      ch.forEach(function (c) { total += c.dl; });
      var factChunks = {};
      ch.forEach(function (c, ci) { c.facts.forEach(function (e) { (factChunks[e] = factChunks[e] || []).push(ci); }); });
      cache[key] = { ch: ch, df: df, N: ch.length, avgdl: total / ch.length, factChunks: factChunks };
      return cache[key];
    }

    function rank(F, query) {
      var key = "r" + F + "|" + query;
      if (cache[key]) return cache[key];
      var idx = chunks(F);
      var seen = {}, q = [];
      tokens(query).forEach(function (t) { if (!STOP[t] && !seen[t]) { seen[t] = true; q.push(t); } });
      q.sort();
      var Nc = idx.N, avgdl = idx.avgdl, scores = new Array(Nc);
      for (var ci = 0; ci < Nc; ci++) {
        var c = idx.ch[ci], s = 0;
        for (var j = 0; j < q.length; j++) {
          var tf = c.tf[q[j]] || 0;
          if (tf === 0) continue;
          var n = idx.df[q[j]];
          var idf = Math.log(1 + (Nc - n + 0.5) / (n + 0.5));
          s += idf * (tf * (K1 + 1)) / (tf + K1 * (1 - B + B * c.dl / avgdl));
        }
        scores[ci] = Math.floor(s * 1e9 + 0.5) / 1e9;
      }
      var order = [];
      for (ci = 0; ci < Nc; ci++) order.push(ci);
      order.sort(function (a, b) { return scores[b] - scores[a] || a - b; });
      var rankOf = new Array(Nc);
      order.forEach(function (c2, r) { rankOf[c2] = r + 1; });
      cache[key] = { order: order, rankOf: rankOf, scores: scores, terms: q };
      return cache[key];
    }

    /* ---- the pattern language: MATCH (a:Label {name:"..."})-[:TYPE*m..n]->(b) ... RETURN var ---- */
    var NODE_RE = /\(\s*(\w*)\s*(?::\s*(\w+))?\s*(?:\{\s*(\w+)\s*:\s*"([^"]*)"\s*\})?\s*\)/y;
    var REL_RE = /(<-)?\[\s*(?::\s*(\w+))?\s*(\*\s*(\d*)\s*(?:\.\.\s*(\d*))?)?\s*\](->|-)/y;
    function parse(src) {
      var m = /^\s*MATCH\s+([\s\S]*?)\s+RETURN\s+(\w+)\s*$/.exec(src);
      if (!m) throw new Error("A query here is MATCH <pattern> RETURN <variable>.");
      var body = m[1], ret = m[2], pos = 0, parts = [];
      while (pos < body.length) {
        if (/\s/.test(body[pos])) { pos++; continue; }
        NODE_RE.lastIndex = pos; REL_RE.lastIndex = pos;
        var mm = NODE_RE.exec(body);
        if (mm) {
          pos = NODE_RE.lastIndex;
          parts.push({ node: true, v: mm[1] || null, label: mm[2] || null, key: mm[3] || null, val: mm[4] === undefined ? null : mm[4] });
          continue;
        }
        mm = REL_RE.exec(body);
        if (mm) {
          pos = REL_RE.lastIndex;
          var left = mm[1], right = mm[6];
          if (left && right === "->") throw new Error("A relationship cannot point both ways.");
          if (!left && right !== "->") throw new Error("Undirected relationships are not in this subset: add -> or <-.");
          var lo = 1, hi = 1;
          if (mm[3]) {
            var a = mm[4], b = mm[5], hasRange = mm[3].indexOf("..") >= 0;
            lo = a ? parseInt(a, 10) : 1;
            hi = b ? parseInt(b, 10) : ((a && !hasRange) ? lo : 4);
            if (!hasRange && !a) { lo = 1; hi = 4; }
          }
          parts.push({ node: false, type: mm[2] || null, dir: left ? "in" : "out", lo: lo, hi: hi });
          continue;
        }
        if (body[pos] === "-") { pos++; continue; }
        throw new Error("Cannot read the pattern near: " + body.slice(pos, pos + 20));
      }
      var nodes = [], rels = [];
      parts.forEach(function (p, k) { (k % 2 === 0 ? nodes : rels).push(p); });
      var okShape = nodes.every(function (p) { return p.node; }) && rels.every(function (r) { return !r.node; }) && nodes.length === rels.length + 1;
      if (!okShape) throw new Error("The pattern must alternate (node) -[relationship]- (node).");
      var vars = nodes.map(function (p) { return p.v; });
      if (vars.indexOf(ret) < 0) throw new Error("RETURN names a variable the pattern does not bind.");
      rels.forEach(function (r) { if (r.type && D.etypes.indexOf(r.type) < 0) throw new Error("Unknown relationship type " + r.type + ". Types: " + D.etypes.join(", ") + "."); });
      nodes.forEach(function (p) { if (p.label && LABELS.indexOf(p.label) < 0) throw new Error("Unknown label " + p.label + ". Labels: " + LABELS.join(", ") + "."); });
      return { nodes: nodes, rels: rels, ret: vars.indexOf(ret) };
    }

    function nodeOk(i, p) {
      if (p.label && LABELS[D.k[i]] !== p.label) return false;
      if (p.key === "name" && D.n[i] !== p.val) return false;
      if (p.key === "qid" && ("Q" + D.q[i]) !== p.val) return false;
      return true;
    }

    function match(pat, drop, hopLimit) {
      if (hopLimit === undefined || hopLimit === null) hopLimit = 99;
      var nodes = pat.nodes, rels = pat.rels, p0 = nodes[0], starts = [];
      if (p0.key === "name") (byname[p0.val] || []).forEach(function (s) { if (nodeOk(s, p0)) starts.push(s); });
      else for (var s = 0; s < N; s++) if (nodeOk(s, p0)) starts.push(s);
      var answers = {}, evidence = {}, paths = 0;
      function stepEdges(n, rel) {
        var res = [], lst = rel.dir === "out" ? out[n] : inc[n];
        for (var j = 0; j < lst.length; j++) {
          var ei = lst[j], t = edges[ei][0];
          if (rel.type && t !== rel.type) continue;
          if (drop && t === drop) continue;
          res.push([ei, rel.dir === "out" ? edges[ei][2] : edges[ei][1]]);
        }
        return res;
      }
      function walk(ri, n, used, path, bound, hops) {
        if (ri === rels.length) {
          paths++;
          answers[bound[pat.ret]] = true;
          path.forEach(function (e) { evidence[e] = true; });
          return;
        }
        var rel = rels[ri];
        (function seg(n2, depth, used2, path2) {
          if (depth >= rel.lo && nodeOk(n2, nodes[ri + 1])) walk(ri + 1, n2, used2, path2, bound.concat([n2]), hops + depth);
          if (depth === rel.hi || hops + depth >= hopLimit) return;
          stepEdges(n2, rel).forEach(function (x) {
            if (used2[x[0]]) return;
            var u = {}; Object.keys(used2).forEach(function (k) { u[k] = true; }); u[x[0]] = true;
            seg(x[1], depth + 1, u, path2.concat([x[0]]));
          });
        })(n, 0, used, path);
      }
      starts.forEach(function (s0) { walk(0, s0, {}, [], [s0], 0); });
      var num = function (a, b) { return a - b; };
      return { answers: Object.keys(answers).map(Number).sort(num), evidence: Object.keys(evidence).map(Number).sort(num), paths: paths };
    }

    function hopsOf(pat) { var h = 0; pat.rels.forEach(function (r) { h += r.hi; }); return h; }

    function cachedMatch(q, drop, hop) {
      var key = "m" + q.id + "|" + (drop || "") + "|" + hop;
      if (!cache[key]) cache[key] = match(parse(q.cypher), drop || null, hop);
      return cache[key];
    }

    function run(st) {
      var k = st.k, F = st.F, hop = st.hop, drop = st.drop || null;
      var idx = chunks(F), rows = [];
      SPEC.questions.forEach(function (q) {
        var truth = cachedMatch(q, null, 99), got = cachedMatch(q, drop, hop);
        var rk = rank(F, q.text), need = 0;
        truth.evidence.forEach(function (e) {
          var best = Infinity;
          idx.factChunks[e].forEach(function (ci) { if (rk.rankOf[ci] < best) best = rk.rankOf[ci]; });
          if (best > need) need = best;
        });
        var words = 0;
        for (var j = 0; j < k && j < rk.order.length; j++) words += idx.ch[rk.order[j]].words;
        var same = got.answers.length === truth.answers.length && got.answers.every(function (a, j) { return a === truth.answers[j]; });
        rows.push({ id: q.id, hop: q.hop, truth: truth.answers.length, facts: truth.evidence.length,
                    kNeed: need, chunkFound: need <= k, ctxWords: words, graphGot: got.answers.length, graphFound: same });
      });
      var byHop = {};
      [1, 2, 3, 4].forEach(function (h) {
        var rs = rows.filter(function (r) { return r.hop === h; });
        byHop[String(h)] = { n: rs.length, chunk: rs.filter(function (r) { return r.chunkFound; }).length,
                             graph: rs.filter(function (r) { return r.graphFound; }).length };
      });
      var n = rows.length, cf = 0, gf = 0, tw = 0, tf = 0;
      rows.forEach(function (r) { if (r.chunkFound) cf++; if (r.graphFound) gf++; });
      rows.forEach(function (r) { tw += r.ctxWords; });
      rows.forEach(function (r) { tf += r.facts; });
      return { rows: rows, byHop: byHop, n: n, chunkFound: cf, graphFound: gf,
               chunkPct: fl((200 * cf + n) / (2 * n)), graphPct: fl((200 * gf + n) / (2 * n)),
               avgCtxWords: fl(tw / n + 0.5), avgFacts: fl(tf * 10 / n + 0.5) / 10, chunks: idx.N };
    }

    function query(src, drop, hop) {
      var pat = parse(src), r = match(pat, drop || null, hop || 99);
      return { answers: r.answers, labels: r.answers.map(function (a) { return D.n[a]; }), evidence: r.evidence,
               paths: r.paths, hops: hopsOf(pat) };
    }

    return { N: N, edges: edges, parse: parse, match: match, hopsOf: hopsOf, chunks: chunks, rank: rank,
             run: run, query: query, factsOf: factsOf, sentence: sentence, byname: byname };
  }

  /* ---------------- graph algorithms (same graph, undirected views) ---------------- */
  function makeAlgo(D, E) {
    var cache = {};
    function view(mode) {
      if (cache["v" + mode]) return cache["v" + mode];
      var keep = [], i, nb = {}, idOf = {};
      E.edges.forEach(function (e) {
        if (mode === "advisor" && e[0] !== "ADVISED") return;
        if (e[1] === e[2]) return;
        (nb[e[1]] = nb[e[1]] || {})[e[2]] = true;
        (nb[e[2]] = nb[e[2]] || {})[e[1]] = true;
      });
      for (i = 0; i < E.N; i++) if (nb[i]) { idOf[i] = keep.length; keep.push(i); }
      var adj = keep.map(function (g) {
        return Object.keys(nb[g]).map(Number).sort(function (a, b) { return a - b; }).map(function (x) { return idOf[x]; });
      });
      var m = 0; adj.forEach(function (a) { m += a.length; });
      cache["v" + mode] = { nodes: keep, adj: adj, n: keep.length, m: m / 2, idOf: idOf };
      return cache["v" + mode];
    }
    function degree(mode) {
      var V = view(mode);
      return V.adj.map(function (a) { return a.length; });
    }
    function betweenness(mode) {
      var key = "b" + mode;
      if (cache[key]) return cache[key];
      var V = view(mode), n = V.n, adj = V.adj, bc = new Array(n), s, i;
      for (i = 0; i < n; i++) bc[i] = 0;
      var sigma = new Array(n), dist = new Array(n), delta = new Array(n), preds = new Array(n), stack = [], queue = new Array(n);
      for (s = 0; s < n; s++) {
        for (i = 0; i < n; i++) { sigma[i] = 0; dist[i] = -1; delta[i] = 0; preds[i] = []; }
        sigma[s] = 1; dist[s] = 0; stack.length = 0;
        var qh = 0, qt = 0; queue[qt++] = s;
        while (qh < qt) {
          var v = queue[qh++]; stack.push(v);
          var av = adj[v];
          for (var j = 0; j < av.length; j++) {
            var w = av[j];
            if (dist[w] < 0) { dist[w] = dist[v] + 1; queue[qt++] = w; }
            if (dist[w] === dist[v] + 1) { sigma[w] += sigma[v]; preds[w].push(v); }
          }
        }
        while (stack.length) {
          var w2 = stack.pop(), pw = preds[w2];
          for (var k = 0; k < pw.length; k++) { var v2 = pw[k]; delta[v2] += (sigma[v2] / sigma[w2]) * (1 + delta[w2]); }
          if (w2 !== s) bc[w2] += delta[w2];
        }
      }
      var scale = n > 2 ? 1 / ((n - 1) * (n - 2)) : 1;
      cache[key] = bc.map(function (x) { return x * scale; });
      return cache[key];
    }
    function pagerank(mode) {
      var key = "p" + mode;
      if (cache[key]) return cache[key];
      var V = view(mode), n = V.n, adj = V.adj, pr = new Array(n), nx = new Array(n), it, v, j;
      for (v = 0; v < n; v++) pr[v] = 1 / n;
      for (it = 0; it < 100; it++) {
        for (v = 0; v < n; v++) {
          var s = 0, av = adj[v];
          for (j = 0; j < av.length; j++) s += pr[av[j]] / adj[av[j]].length;
          nx[v] = (1 - 0.85) / n + 0.85 * s;
        }
        for (v = 0; v < n; v++) pr[v] = nx[v];
      }
      cache[key] = pr.slice();
      return cache[key];
    }
    function communities(mode) {
      var key = "c" + mode;
      if (cache[key]) return cache[key];
      var V = view(mode), n = V.n, adj = V.adj, lab = [], v, rounds = 0, changed = true;
      for (v = 0; v < n; v++) lab.push(v);
      while (changed && rounds < 30) {
        changed = false; rounds++;
        for (v = 0; v < n; v++) {
          var cnt = {}, best = -1, bestC = 0, av = adj[v];
          if (!av.length) continue;
          for (var j = 0; j < av.length; j++) { var L = lab[av[j]]; cnt[L] = (cnt[L] || 0) + 1; }
          Object.keys(cnt).forEach(function (L) {
            var c = cnt[L], l = +L;
            if (c > bestC || (c === bestC && l < best)) { best = l; bestC = c; }
          });
          if (best !== lab[v]) { lab[v] = best; changed = true; }
        }
      }
      var groups = {};
      lab.forEach(function (L, v2) { (groups[L] = groups[L] || []).push(v2); });
      var list = Object.keys(groups).map(function (L) { return groups[L]; });
      list.sort(function (a, b) { return b.length - a.length || a[0] - b[0]; });
      cache[key] = { rounds: rounds, groups: list, converged: !changed };
      return cache[key];
    }
    function path(mode, a, b) {
      var V = view(mode), s = V.idOf[a], t = V.idOf[b];
      if (s === undefined || t === undefined) return null;
      var par = new Array(V.n), q = [s], h = 0;
      for (var i = 0; i < V.n; i++) par[i] = -2;
      par[s] = -1;
      while (h < q.length) {
        var v = q[h++];
        if (v === t) break;
        V.adj[v].forEach(function (w) { if (par[w] === -2) { par[w] = v; q.push(w); } });
      }
      if (par[t] === -2) return [];
      var p = [], c = t;
      while (c !== -1) { p.push(V.nodes[c]); c = par[c]; }
      return p.reverse();
    }
    function top(mode, scores, k) {
      var V = view(mode), idx = scores.map(function (x, i) { return i; });
      idx.sort(function (a, b) { return scores[b] - scores[a] || V.nodes[a] - V.nodes[b]; });
      return idx.slice(0, k).map(function (i) { return { node: V.nodes[i], score: scores[i] }; });
    }
    return { view: view, degree: degree, betweenness: betweenness, pagerank: pagerank, communities: communities, path: path, top: top };
  }

  var api = { SPEC: SPEC, LADDER: SPEC.ladder, QUESTIONS: SPEC.questions, LEVERS: SPEC.levers, GLOBAL_Q: GLOBAL_Q,
              makeEngine: makeEngine, makeAlgo: makeAlgo, tokens: tokens };
  if (typeof module !== "undefined" && module.exports) { module.exports = api; return; }

  /* ------------------------------------------------------------------ widgets */
  var D = root.KGR_DATA;
  if (!D) return;
  var ENG = makeEngine(D), ALG = makeAlgo(D, ENG);
  var DROP_LABEL = { "": "None, all extracted", ADVISED: "ADVISED (doctoral advisor)", EDUCATED_AT: "EDUCATED_AT",
                     EMPLOYED_BY: "EMPLOYED_BY", WON: "WON (the prize)", CITIZEN_OF: "CITIZEN_OF" };
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function opt(v, label, cur) { return '<option value="' + esc(v) + '"' + (String(v) === String(cur) ? " selected" : "") + ">" + esc(label) + "</option>"; }

  function buildBench(host, bi) {
    var start = host.getAttribute("data-rung");
    if (start === null) start = "r1";
    var st = { k: 10, F: 2, hop: 4, drop: "", rung: start };
    SPEC.ladder.forEach(function (r) { if (r.id === start) { st.k = r.s.k; st.F = r.s.F; st.hop = r.s.hop; st.drop = r.s.drop; } });
    var P = "kgrb" + bi + "-";
    var nP = 0, nI = 0;
    D.k.forEach(function (k) { if (k === 0) nP++; else if (k === 1) nI++; });
    var nE = ENG.edges.length;
    host.innerHTML =
      '<div class="kgr-head"><h4>Vellum multi-hop lab</h4>' +
      '<p class="kgr-rail"><b>Real rows, computed live.</b> ' + nP + " people, " + nI + " institutions and " + nE +
      " typed edges from Wikidata (CC0), fetched 2026-11-16. 24 fixed questions, 6 at each hop depth. Graph answers come from a pattern matcher over the edges; chunk answers from BM25 top-k over sentences <b>generated from the same facts</b>. The chunk baseline is keyword BM25, not embeddings: vector retrieval is taught in the RAG course. Vellum Press is constructed; the data is not.</p></div>" +
      '<div class="kgr-rungs" role="group" aria-label="Ladder presets">' + SPEC.ladder.map(function (r) {
        return '<button type="button" class="kgr-rung' + (r.trap ? " is-trap" : "") + '" data-r="' + r.id + '"><b>' + (r.trap ? "Trap" : r.id.toUpperCase()) + "</b> " + esc(r.label) + "</button>";
      }).join("") + "</div>" +
      '<div class="kgr-levers">' +
      '<label>Chunks retrieved, k<select id="' + P + 'k">' + SPEC.levers.k.map(function (v) { return opt(v, v + " chunks", st.k); }).join("") + "</select></label>" +
      '<label>Chunk size<select id="' + P + 'F">' + SPEC.levers.F.map(function (v) { return opt(v, v + (v === 1 ? " fact" : " facts") + " per chunk", st.F); }).join("") + "</select></label>" +
      '<label>Graph hop limit<select id="' + P + 'hop">' + SPEC.levers.hop.map(function (v) { return opt(v, v + (v === 1 ? " hop" : " hops"), st.hop); }).join("") + "</select></label>" +
      '<label>Edge type never extracted<select id="' + P + 'drop">' + SPEC.levers.drop.map(function (v) { return opt(v, DROP_LABEL[v], st.drop); }).join("") + "</select></label>" +
      "</div>" +
      '<div class="kgr-headline" id="' + P + 'head" aria-live="polite"></div>' +
      '<div class="kgr-hops" id="' + P + 'hops"></div>' +
      '<details class="kgr-qs"><summary>All 24 questions, both methods</summary><div class="kgr-tablewrap" id="' + P + 'table"></div></details>';
    var $ = function (id) { return host.querySelector("#" + P + id); };
    function sync() {
      $("k").value = String(st.k); $("F").value = String(st.F); $("hop").value = String(st.hop); $("drop").value = st.drop;
      host.querySelectorAll(".kgr-rung").forEach(function (b) { b.classList.toggle("is-on", b.getAttribute("data-r") === st.rung); });
    }
    function render() {
      var r = ENG.run(st);
      host._last = r;
      var head = $("head");
      head.className = "kgr-headline" + (st.drop ? " is-bad" : "");
      head.innerHTML =
        '<span class="kgr-big"><b data-k="chunkFound">' + r.chunkFound + "</b> of " + r.n + ' found by chunks <i data-k="chunkPct">' + r.chunkPct + "%</i></span>" +
        '<span class="kgr-vs">vs</span>' +
        '<span class="kgr-big kgr-g"><b data-k="graphFound">' + r.graphFound + "</b> of " + r.n + ' found by the graph <i data-k="graphPct">' + r.graphPct + "%</i></span>" +
        '<span class="kgr-cost">Context per question: <b data-k="avgCtxWords">' + r.avgCtxWords + "</b> words of chunks vs <b data-k=\"avgFacts\">" + r.avgFacts.toFixed(1) + "</b> facts from the graph</span>";
      $("hops").innerHTML = '<div class="kgr-hoprow kgr-hophead"><span>Hop depth</span><span>Chunks, top ' + st.k + "</span><span>Graph, limit " + st.hop + (st.drop ? ", no " + esc(st.drop) : "") + "</span></div>" +
        [1, 2, 3, 4].map(function (h) {
          var a = r.byHop[String(h)];
          return '<div class="kgr-hoprow"><span>' + h + (h === 1 ? " hop" : " hops") + "</span>" +
            '<span><i class="kgr-bar"><i style="width:' + Math.round(100 * a.chunk / a.n) + '%"></i></i><b data-k="c' + h + '">' + a.chunk + "</b>/" + a.n + "</span>" +
            '<span><i class="kgr-bar is-g"><i style="width:' + Math.round(100 * a.graph / a.n) + '%"></i></i><b data-k="g' + h + '">' + a.graph + "</b>/" + a.n + "</span></div>";
        }).join("") +
        '<p class="kgr-note">Chunks: found only if every fact the answer needs is in the top ' + st.k + ". Graph: found only if the returned rows equal the full answer. A missing edge type returns fewer rows with no error at all.</p>";
      $("table").innerHTML = '<table class="kgr-table"><thead><tr><th>#</th><th>Hops</th><th>Question</th><th>Facts needed</th><th>Chunks: k needed</th><th>Graph rows</th></tr></thead><tbody>' +
        r.rows.map(function (row, i) {
          var q = SPEC.questions[i];
          return "<tr><td>" + esc(q.id) + "</td><td>" + q.hop + "</td><td>" + esc(q.text) + '<code class="kgr-cy">' + esc(q.cypher) + "</code></td><td>" + row.facts + "</td>" +
            '<td class="' + (row.chunkFound ? "kgr-ok" : "kgr-no") + '">' + row.kNeed + (row.chunkFound ? " (found)" : " (not found)") + "</td>" +
            '<td class="' + (row.graphFound ? "kgr-ok" : "kgr-no") + '">' + row.graphGot + " of " + row.truth + (row.graphFound ? " (found)" : " (not found)") + "</td></tr>";
        }).join("") + "</tbody></table>";
    }
    function lever() {
      st.k = +$("k").value; st.F = +$("F").value; st.hop = +$("hop").value; st.drop = $("drop").value;
      st.rung = "";
      SPEC.ladder.forEach(function (r) { if (r.s.k === st.k && r.s.F === st.F && r.s.hop === st.hop && r.s.drop === st.drop && !st.rung) st.rung = r.id; });
      sync(); render();
    }
    ["k", "F", "hop", "drop"].forEach(function (id) { $(id).addEventListener("change", lever); });
    function setRung(id) {
      SPEC.ladder.forEach(function (r) { if (r.id === id) { st.k = r.s.k; st.F = r.s.F; st.hop = r.s.hop; st.drop = r.s.drop; st.rung = id; } });
      sync(); render(); return host._last;
    }
    host.querySelectorAll(".kgr-rung").forEach(function (b) { b.addEventListener("click", function () { setRung(b.getAttribute("data-r")); }); });
    sync(); render();
    return { setRung: setRung, state: st, last: function () { return host._last; } };
  }

  function buildQuery(host, qi) {
    var P = "kgrq" + qi + "-";
    var presets = [];
    host.querySelectorAll("template[data-q]").forEach(function (t) { presets.push({ label: t.getAttribute("data-q"), src: t.innerHTML.replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&amp;/g, "&").trim() }); });
    if (!presets.length) presets.push({ label: "Laureates whose advisor also won", src: GLOBAL_Q });
    host.innerHTML =
      '<div class="kgr-head"><h4>Vellum query box</h4><p class="kgr-rail"><b>A teaching subset of Cypher, run in your browser</b> on the same Wikidata graph. One linear pattern: <code>(var:Label {name:"..."})</code> nodes, <code>-[:TYPE]-&gt;</code> or <code>&lt;-[:TYPE*m..n]-</code> relationships, <code>RETURN var</code>. Labels: Person, Institution, Country, Prize. Types: ' + D.etypes.join(", ") + ". No WHERE, no aggregation; a bare * stops at 4 hops.</p></div>" +
      '<div class="kgr-presets">' + presets.map(function (p, i) { return '<button type="button" class="kgr-rung" data-p="' + i + '">' + esc(p.label) + "</button>"; }).join("") + "</div>" +
      '<textarea class="kgr-src" id="' + P + 'src" spellcheck="false" aria-label="Pattern to run" rows="3"></textarea>' +
      '<div class="kgr-qbar"><button type="button" class="btn primary" id="' + P + 'run">Run</button><span class="kgr-qmeta" id="' + P + 'meta" aria-live="polite"></span></div>' +
      '<div class="kgr-out" id="' + P + 'out"></div>';
    var $ = function (id) { return host.querySelector("#" + P + id); };
    function go() {
      var src = $("src").value;
      try {
        var r = ENG.query(src);
        host._last = r;
        $("meta").innerHTML = '<b data-k="rows">' + r.answers.length + "</b> rows · " + r.paths + " matching paths · " + r.evidence.length + " facts used · pattern length " + r.hops + (r.hops === 1 ? " hop" : " hops");
        $("out").innerHTML = r.answers.length ? r.labels.slice(0, 60).map(function (l, i) {
          return '<span class="kgr-chip" title="Q' + D.q[r.answers[i]] + '">' + esc(l) + "</span>"; }).join("") +
          (r.answers.length > 60 ? '<span class="kgr-more">+ ' + (r.answers.length - 60) + " more</span>" : "")
          : '<p class="kgr-empty">No rows. The pattern ran; nothing in this graph matches it. That is not the same as "false": the graph may simply be missing the edge.</p>';
      } catch (e) {
        host._last = { error: e.message };
        $("meta").textContent = "";
        $("out").innerHTML = '<p class="kgr-err">' + esc(e.message) + "</p>";
      }
    }
    host.querySelectorAll("[data-p]").forEach(function (b) { b.addEventListener("click", function () { $("src").value = presets[+b.getAttribute("data-p")].src; go(); }); });
    $("run").addEventListener("click", go);
    $("src").value = presets[0].src; go();
    return { run: function (src) { $("src").value = src; go(); return host._last; } };
  }

  function buildAlgo(host, ai) {
    var P = "kgra" + ai + "-";
    var st = { mode: host.getAttribute("data-mode") || "advisor", measure: host.getAttribute("data-measure") || "degree" };
    var MEAS = { degree: "Degree (distinct neighbours)", betweenness: "Betweenness (normalised)", pagerank: "PageRank (alpha 0.85, 100 iterations)", communities: "Communities (label propagation)" };
    var people = [];
    D.k.forEach(function (k, i) { if (k === 0) people.push(i); });
    host.innerHTML =
      '<div class="kgr-head"><h4>Who connects Vellum\'s network</h4><p class="kgr-rail"><b>Computed in your browser</b> on the same Wikidata graph, as an undirected view. The advisor network keeps only ADVISED edges; the full graph adds institutions, countries and the prize nodes. Betweenness on the full graph takes a second or two.</p></div>' +
      '<div class="kgr-levers">' +
      '<label>Graph<select id="' + P + 'mode">' + opt("advisor", "Advisor network (people, ADVISED)", st.mode) + opt("full", "Full graph (every node and edge type)", st.mode) + "</select></label>" +
      '<label>Measure<select id="' + P + 'meas">' + Object.keys(MEAS).map(function (m) { return opt(m, MEAS[m], st.measure); }).join("") + "</select></label></div>" +
      '<div class="kgr-algo-out" id="' + P + 'out" aria-live="polite"></div>' +
      '<div class="kgr-path"><label>From<input list="' + P + 'dl" id="' + P + 'a" value="Esther Duflo"></label><label>To<input list="' + P + 'dl" id="' + P + 'b" value="Paul Samuelson"></label>' +
      '<button type="button" class="btn" id="' + P + 'go">Shortest path</button></div>' +
      '<datalist id="' + P + 'dl">' + people.map(function (i) { return '<option value="' + esc(D.n[i]) + '">'; }).join("") + "</datalist>" +
      '<div class="kgr-out" id="' + P + 'pout"></div>';
    var $ = function (id) { return host.querySelector("#" + P + id); };
    var KIND = ["person", "institution", "country", "prize"];
    function render() {
      var V = ALG.view(st.mode), html = '<p class="kgr-note">' + V.n + " nodes, " + V.m + " undirected edges in this view.</p>";
      if (st.measure === "communities") {
        var c = ALG.communities(st.mode), deg = ALG.degree(st.mode);
        host._last = { communities: c.groups.length, largest: c.groups[0].length, rounds: c.rounds };
        html += '<p class="kgr-note"><b data-k="ncomm">' + c.groups.length + "</b> communities after " + c.rounds + " rounds" + (c.converged ? "" : " (stopped at the cap)") + ". The five largest, each named by its three best-connected members:</p><ol class=\"kgr-top\">" +
          c.groups.slice(0, 5).map(function (g) {
            var named = g.slice().sort(function (a, b) { return deg[b] - deg[a] || a - b; }).slice(0, 3).map(function (v) { return esc(D.n[V.nodes[v]]); }).join(", ");
            return "<li><b>" + g.length + " nodes</b> · " + named + "</li>";
          }).join("") + "</ol>";
      } else {
        var sc = st.measure === "degree" ? ALG.degree(st.mode) : st.measure === "betweenness" ? ALG.betweenness(st.mode) : ALG.pagerank(st.mode);
        var t = ALG.top(st.mode, sc, 10);
        host._last = { top: t.map(function (x) { return D.n[x.node]; }), scores: t.map(function (x) { return x.score; }) };
        html += '<ol class="kgr-top">' + t.map(function (x) {
          var v = st.measure === "degree" ? x.score : x.score.toFixed(4);
          return "<li><b>" + esc(D.n[x.node]) + '</b> <span class="kgr-kind">' + KIND[D.k[x.node]] + "</span> · " + v + "</li>";
        }).join("") + "</ol>";
      }
      $("out").innerHTML = html;
    }
    function path() {
      var a = (ENG.byname[$("a").value] || [])[0], b = (ENG.byname[$("b").value] || [])[0];
      if (a === undefined || b === undefined) { $("pout").innerHTML = '<p class="kgr-err">Pick two names from the list.</p>'; return; }
      var p = ALG.path(st.mode, a, b);
      host._path = p;
      if (p === null) { $("pout").innerHTML = '<p class="kgr-empty">One of them has no edge in this view.</p>'; return; }
      if (!p.length) { $("pout").innerHTML = '<p class="kgr-empty">No path in this view.</p>'; return; }
      $("pout").innerHTML = '<p class="kgr-note"><b data-k="plen">' + (p.length - 1) + "</b> hops:</p><p>" + p.map(function (v) {
        return '<span class="kgr-chip' + (D.k[v] !== 0 ? " is-hub" : "") + '">' + esc(D.n[v]) + "</span>"; }).join(' <span class="kgr-arr">to</span> ') + "</p>";
    }
    $("mode").addEventListener("change", function () { st.mode = $("mode").value; render(); path(); });
    $("meas").addEventListener("change", function () { st.measure = $("meas").value; render(); });
    $("go").addEventListener("click", path);
    render(); path();
    return { set: function (mode, measure) { st.mode = mode; st.measure = measure; $("mode").value = mode; $("meas").value = measure; render(); path(); return host._last; },
             path: function (a, b) { $("a").value = a; $("b").value = b; path(); return host._path ? host._path.map(function (v) { return D.n[v]; }) : null; } };
  }

  function init() {
    root.KGR_BENCH = { engine: ENG, algo: ALG, benches: [], queries: [], algos: [] };
    document.querySelectorAll(".kgr-bench").forEach(function (h, i) { root.KGR_BENCH.benches.push(buildBench(h, i)); });
    document.querySelectorAll(".kgr-query").forEach(function (h, i) { root.KGR_BENCH.queries.push(buildQuery(h, i)); });
    document.querySelectorAll(".kgr-algo").forEach(function (h, i) { root.KGR_BENCH.algos.push(buildAlgo(h, i)); });
    if (root.KGR_BENCH.benches.length) root.KGR_BENCH.setRung = root.KGR_BENCH.benches[0].setRung;
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})(typeof window !== "undefined" ? window : this);
