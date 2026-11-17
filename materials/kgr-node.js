// Node runner: loads the REAL browser engine (assets/kgr-live.js) + sample and writes every
// scenario as JSON in the same shape as kgr_reference.py. Usage: node materials/kgr-node.js out.json [fault]
const path = require("path"), fs = require("fs");
const D = require(path.join(__dirname, "..", "assets", "kgr-sample.js"));
const M = require(path.join(__dirname, "..", "assets", "kgr-live.js"));
const E = M.makeEngine(D), A = M.makeAlgo(D, E);
const res = {};
M.LEVERS.k.forEach(k => M.LEVERS.F.forEach(F => M.LEVERS.hop.forEach(h => M.LEVERS.drop.forEach(d => {
  res["k" + k + "|F" + F + "|h" + h + "|" + (d || "none")] = E.run({ k: k, F: F, hop: h, drop: d });
}))));
const r9 = v => Math.round(v * 1e9) / 1e9;
const algo = {};
["advisor", "full"].forEach(mode => {
  const V = A.view(mode), o = { n: V.n, m: V.m };
  ["degree", "betweenness", "pagerank"].forEach(meas => {
    o[meas] = A.top(mode, A[meas](mode), 10).map(x => [D.n[x.node], r9(x.score)]);
  });
  const c = A.communities(mode), deg = A.degree(mode);
  o.communities = { count: c.groups.length, rounds: c.rounds, converged: c.converged,
    top5: c.groups.slice(0, 5).map(g => [g.length, g.slice().sort((a, b) => deg[b] - deg[a] || a - b).slice(0, 3).map(v => D.n[V.nodes[v]])]) };
  const p = A.path(mode, E.byname["Esther Duflo"][0], E.byname["Paul Samuelson"][0]) || [];
  o.path = p.map(x => D.n[x]);
  algo[mode] = o;
});
res.algo = algo;
const g = E.query(M.GLOBAL_Q);
res.global = { rows: g.answers.length, facts: g.evidence.length, paths: g.paths };
if (process.argv[3]) { const k = Object.keys(res)[57]; res[k].rows[5].kNeed += 1; } // planted fault
fs.writeFileSync(process.argv[2], JSON.stringify(res));
console.log("node scenarios", Object.keys(res).length - 2);
