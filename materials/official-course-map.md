# Official course map - learn-knowledge-graphs-with-phoebe

Internal build document (never linked from an audience page). Built 2026-11-16 by the course lead.
Every verified fact with its evidence tier lives in `materials/sources-verified.md` (109 facts, 99
read at source, 10 reported); this map lists what each session uses, the canon numbers, the seams
and what is not covered. Pages quote ONLY numbers from this map or from the live widget.

## Shape

Single track, 6 sessions x 45 min, bucket deng, audience builder (data and ML engineers who know SQL
and RAG basics; prerequisite learn-rag b1-b4). Session 4 is the bench. Palette graph teal #004238.

## Running case

**Vellum Press** - a constructed academic publisher. Label on every use: "Constructed Vellum example".
Its research desk answers questions like "which laureates studied under someone who also won?".
Vellum is invented; its graph is real Wikidata data (CC0). Running artifact: **Vellum's graph design
note**, one section per session: (1) question sort, (2) graph model, (3) four queries, (4) multi-hop
result, (5) network finding, (6) graph / vectors / both decision with cost.

## Data (real rows)

- Source: Wikidata, structured data CC0 (Wikidata:Copyright, read at source).
- Fetched 2026-11-16. Step 1, SPARQL on query.wikidata.org (saved with its result in
  `materials/raw/laureates_raw.json`):
  ```
  SELECT ?p ?prize ?year WHERE {
    VALUES ?prize { wd:Q38104 wd:Q44585 wd:Q80061 wd:Q37922 wd:Q35637 wd:Q47170 }
    ?p p:P166 ?st . ?st ps:P166 ?prize . ?p wdt:P31 wd:Q5 .
    OPTIONAL { ?st pq:P585 ?t . BIND(YEAR(?t) AS ?year) }
  }
  ```
  1,005 award statements, 1,000 distinct people, every row with a year.
  Prizes: Physics Q38104, Chemistry Q44585, Physiology or Medicine Q80061, Literature Q37922,
  Peace Q35637, Economic Sciences Q47170 (the Sveriges Riksbank prize, counted with the others here,
  as Wikidata's award list does; organisations that won Peace are excluded by P31 = Q5 human).
- Step 2, the Wikidata API (wbgetentities, labels en with mul fallback) for every laureate, their
  doctoral advisors and those advisors' advisors (two levels up): P69 educated at, P108 employer,
  P184 doctoral advisor, P185 doctoral student, P27 country of citizenship; labels for every
  institution and country. Saved as `materials/raw/wikidata_entities.json`. Deprecated-rank
  statements skipped.
- Lesson learned on the way (usable on pages): many items now carry their English name only as a
  "mul" (default for all languages) label, so an English-only label request returned no name for
  Marie Curie (Q7186). Asking for en with mul fallback fixed it.
- The SPARQL endpoint answered 429 (rate limit) during the build; the API route avoided it.
- Build: `materials/build_kgr_sample.py` -> `assets/kgr-sample.js` (json.dumps). CANON_DATA below.

## Engine (assets/kgr-live.js) and reference (materials/kgr_reference.py)

- Graph method: a Cypher-like subset, one linear pattern: `(var:Label {name:"..."})`,
  `-[:TYPE]->`, `<-[:TYPE*m..n]-`, `RETURN var`; relationship uniqueness per path (as Cypher);
  a bare `*` is capped at 4 hops in this subset. Found = returned rows equal the full answer.
- Chunk method: one sentence per fact, generated from the same edges ("X's doctoral advisor was
  Y." appears on both people's pages), F facts per chunk in a fixed order per person; BM25 with
  Lucene's IDF log(1 + (N - n + 0.5)/(n + 0.5)), k1 = 1.2, b = 0.75, a small stopword list; ties
  broken by chunk index. A question counts as found only if every fact on its answer paths sits in
  the top k chunks. "k needed" = the smallest k that would find it.
- Hop limit: graph traversal stops after h edges from the anchor. Drop edge type: that relation
  was never extracted (the graph is missing it; the text still has it).
- Python vs node agree by value on every scenario (CANON_COMPARE below); a planted fault is caught.

CANON_DATA (assets/kgr-sample.js, 244,234 bytes):
- 3,507 nodes: 1,523 people, 1,837 institutions, 141 countries, 6 prizes.
- 10,954 typed edges: WON 1,005 (with year), EDUCATED_AT 3,566, EMPLOYED_BY 3,413, ADVISED 966,
  CITIZEN_OF 2,004. People = 1,000 laureates + their advisors + advisors' advisors.
- 103 entities carried only a "mul" label; 2 institution references had no label at all and were
  dropped. 8 institution labels are shared by two different items (e.g. "King's College",
  "University of Strasbourg"): QIDs keep them apart, text cannot.
- One visible data artefact (checked in the raw extract): Theodor Zincke (Q90591) lists Otto Hahn
  (Q57065) as both a doctoral advisor (P184) and a doctoral student (P185), while Hahn lists Zincke
  as his advisor. The graph therefore holds a two-node loop, Hahn advised Zincke and Zincke advised
  Hahn. Teach as "the graph is only as true as its edges".
- The motivating question as one pattern (GLOBAL_Q in kgr-live.js):
  `MATCH (z1:Prize)<-[:WON]-(a:Person)-[:ADVISED]->(s:Person)-[:WON]->(z2:Prize) RETURN s`
  -> **191 laureates** whose doctoral advisor also won (216 matching paths, 498 facts used).

CANON_LADDER (24 questions, 6 per hop depth; python = node on 90,808 values, 0 mismatches;
planted +1 fault caught, exit 1). Default chunk size F = 2 facts; 6,351 chunks.

| Rung | Setting | Chunks found | Graph found | by hop 1/2/3/4 (chunks; graph) | words of context per question |
|---|---|---|---|---|---|
| R1 | k=3 | 4/24 (17%) | 24/24 | 4,0,0,0 ; 6,6,6,6 | 52 |
| R2 | k=10 | 9/24 (38%) | 24/24 | 6,3,0,0 ; 6,6,6,6 | 174 |
| R3 | k=30 | 9/24 (38%) | 24/24 | 6,3,0,0 | 530 |
| R4 | graph hop limit 1 | (9) | 6/24 (25%) | graph 6,0,0,0 | - |
| R5 | graph full depth | (9) | 24/24 (100%) | graph 6,6,6,6 | graph uses 4.0 facts per question on average |
| Trap | ADVISED never extracted | (9) | 4/24 (17%) | graph 4,0,0,0 | - |

Hop limits 1/2/3/4 -> graph 6/12/18/24. Other dropped types (k=10): EDUCATED_AT 22, EMPLOYED_BY 23,
WON 9, CITIZEN_OF 21 graph found.
Chunk size x k (chunks found / avg words): F1: k3 2/27, k10 5/87, k30 7/268, k100 7/900 (11,920
chunks); F2: 4/52, 9/174, 9/530, 9/1,765; F4: 5/100, 10/338, 10/1,007, 13/3,450 (3,549 chunks);
F8: 8/178, 9/595, 12/1,770, 15/6,001 (2,117 chunks). Never 24 at any setting: the best is 15 of 24
at F8 k100, with 6,001 words per question.
Per question at F2 (k needed): q01 4, q02 1, q03 2, q04 2, q05 4, q06 3, q07 9, q08 6, q09 1,669,
q10 4, q11 2,232, q12 136, q13 434, q14 333, q15 331, q16 119, q17 104, q18 1,804, q19 804,
q20 350, q21 695, q22 1,032, q23 915, q24 470.
Worked example q20 (Esther Duflo, 4 hops), F2: fact ranks Duflo<-Banerjee 1, Banerjee<-Maskin 350,
Maskin<-Arrow 330, Arrow WON Economics 1972 at 313. Query terms after stopwords: advisor, doctoral,
duflo, esther, nobel, prize, win. The bridge names (Banerjee, Maskin, Arrow) are not in the
question. The top chunk says Duflo herself won the Economics prize in 2019: a chunk reader can
land on the right prize for the wrong reason.
Tokeniser quirk: "Delbruck" with umlaut splits into "delbr" + "ck" (a-z0-9 tokens); said on page.

CANON_ALGO (undirected views; Brandes betweenness matches networkx 3.1 to 1e-16; PageRank 100
fixed iterations within 7e-6 of networkx):
- Advisor network: 1,039 people, 965 edges, 145 connected components (networkx).
  Degree top: Ernest Rutherford 15, Joseph John Thomson 10, Wassily Leontief 9, Arnold Sommerfeld 8,
  Ralph H. Fowler 8. Betweenness top: August Kundt 0.0709, Georg Hermann Quincke 0.0704, Gabriel
  Lippmann 0.0622, Franz S. Exner 0.0597, Karl Herzfeld 0.0589 (bridges, none a laureate except
  Lippmann). PageRank top: Rutherford 0.0051, J. J. Thomson 0.0033, Enrico Fermi 0.0033, Leontief
  0.0032, Sommerfeld 0.0029. Label propagation: 216 communities in 7 rounds; largest 60
  (Rutherford, Thomson, Fowler), 41 (Leontief, H. Gregg Lewis, Werner Sombart), 37 (Sommerfeld,
  Teller, Debye), 29 (Helmholtz, Millikan, J. P. Muller), 28 (Baeyer, Emil Fischer, Bunsen).
  networkx Louvain (seed 1) finds 159 communities on the same view.
  Shortest path Esther Duflo -> Paul Samuelson: 7 hops via Banerjee, Maskin, Arrow, Spence,
  Schelling, Leontief.
- Full graph: 3,507 nodes, 10,245 undirected edges. Degree top: United States 629, Physiology or
  Medicine prize 235, Physics prize 230, Harvard University 203, Chemistry prize 200. Betweenness
  top: United States 0.3657, Physics prize 0.1174. PageRank top: United States 0.0245. Label
  propagation: 42 communities, largest 1,521 nodes led by United States. Duflo -> Samuelson: 2 hops
  through the Economics prize node. THE TRAP: hubs that are artefacts of modelling (a country, a
  prize) win every centrality measure and short-circuit every path.

## Per-session coverage

1. **When the question is about relationships** (green). Entity, relation, hop; table vs graph;
   join depth as the tell (one self-join per hop); Hogan et al. definition (read at source); the
   motivating question as one pattern (CANON global). Build-along: sort 10 Vellum questions by hops.
   Card: when a graph beats a table (seam with data-modeling).
2. **Nodes, edges and two models** (green). Labelled property graph (Hogan: property-value pairs on
   nodes and edges); RDF triples, IRIs, literals, blank nodes (RDF 1.1 Primer; RDF 1.2 is a
   Candidate Recommendation Draft dated 16 November 2026, adds triple terms); Wikidata items,
   properties, statements, qualifiers (P585 year on the prize statement), references, ranks, truthy
   wdt: vs p:/ps:/pq:; GQL ISO/IEC 39075:2024 published 2024-04-12 (read at IEC webstore); SQL/PGQ
   9075-16:2023 (reported); schema-first vs schema-later; open-world assumption (Hogan). Node
   identity: QIDs (seam: entity-resolution). Build-along: Vellum's model.
3. **Cypher and SPARQL side by side** (yellow). MATCH patterns; variable-length `*1..3` (not GQL
   conformant per Cypher 25 manual), quantified path patterns since Neo4j 5.9; `SHORTEST k`
   replaces shortestPath(); SPARQL BGPs and property paths (p+, p*, p?, p/q, ^p, p|q), SPARQL 1.1
   Recommendation 21 March 2013; WDQS 60-second timeout. Same question in both. Build-along: 4
   queries in the page's query box.
4. **The multi-hop lab** (orange). The bench.
5. **Paths, centrality, communities** (orange). shortest path, degree, betweenness, PageRank
   (alpha 0.85), label propagation, Louvain (networkx 2.7, Blondel 2008), Leiden (Traag 2019);
   the trap: hub nodes that are data artefacts (a country, a prize). Build-along: who connects
   Vellum's network, computed in page (CANON_ALGO).
6. **GraphRAG** (red). Edge et al. 2024 pipeline and results; LazyGraphRAG 0.1% indexing cost;
   Han et al. 2025, Xiang et al. 2025, Zhou et al. 2025 qualifying results; text-to-Cypher (Neo4j
   Text2Cypher 2024; LangChain security note); cost side. Capstone: graph / vectors / both.

## Seams (pick the side out loud, absolute https links)

| Sibling | They own | We own / link |
|---|---|---|
| learn-rag | embeddings, chunking, vector DBs, hybrid, reranking, RAG eval | graph retrieval; bench baseline is BM25 and says vectors live in rag; s6 links b5 and b9 |
| learn-entity-resolution | deciding two records are one entity | assumed done; s2 links session 1; QIDs solve it here |
| learn-data-modeling | relational modelling | one card in s1, links b3 |
| learn-metadata-catalog-lineage | lineage graphs for data assets | link only (s1) |
| learn-text-to-sql | LLM-to-SQL | s6 links b2 for text-to-Cypher as a variant |

## Not covered (honest list)

- Embedding-based retrieval, rerankers and hybrid search (learn-rag).
- Knowledge graph embeddings and GNNs (named in Hogan's inductive section; not taught).
- OWL reasoning, SHACL validation, ontology engineering in depth.
- Running Neo4j, a triple store or the GraphRAG repo (Self-study cards only; no account needed).
- Iterative multi-step retrieval (IRCoT and similar) as a chunk baseline: the bench's baseline is
  single-shot BM25, said on the widget; iterative retrieval would narrow the gap.
- Graph database performance and benchmarks.

## Constraint reality

No database or account needed. Neo4j Desktop (free) and AuraDB Free (200,000 nodes, 400,000
relationships, 1GB per current quotas page) are Self-study; older pages quoting 50k/175k are stale.

## CANON_QUERIES (query box, computed by assets/kgr-live.js; rows / matching paths / facts / pattern hops)

- `MATCH (p:Person {name:"Dorothy Hodgkin"})-[:WON]->(z:Prize) RETURN z` -> 1 row (Nobel Prize in Chemistry), 1 hop.
- `MATCH (p:Person {name:"Max Planck"})-[:ADVISED]->(s)-[:WON]->(z:Prize) RETURN s` -> 3 rows
  (Max von Laue, Gustav Ludwig Hertz, Walther Bothe), 3 paths, 6 facts, 2 hops.
- `MATCH (p:Person {name:"Esther Duflo"})<-[:ADVISED*1..3]-(a) RETURN a` -> 10 rows (academic
  ancestors up to 3 generations: Kenneth Arrow, Eric Maskin, Abhijit Banerjee, Joshua Angrist,
  David Card, Whitney K. Newey, Jerry A. Hausman, Orley Ashenfelter, ...), 11 paths, 11 facts.
- Same with a bare `*` (capped at 4 in this subset): 14 rows, 17 paths.
- `MATCH (o:Institution {name:"University of Göttingen"})<-[:EDUCATED_AT]-(p)-[:WON]->(z:Prize) RETURN p`
  -> 24 rows (laureates educated at Göttingen), 24 paths, 48 facts, 2 hops.
- `MATCH (p:Person {name:"Max Born"})-[:ADVISED*1..2]->(s)-[:WON]->(z:Prize) RETURN s` -> 4 rows
  (Maria Göppert Mayer, Max Delbrück, Murray Gell-Mann, Willis Lamb), 10 facts.
- `MATCH (p:Person {name:"Marie Curie"})-[:WON]->(z:Prize) RETURN z` -> 2 rows (Physics, Chemistry).
- `MATCH (p:Person {name:"Marie Curie"})-[:ADVISED]->(s)-[:WON]->(z:Prize) RETURN s` -> 0 rows in
  this extract (an empty result, not a proven "none").
- GLOBAL_Q -> 191 rows, 216 paths, 498 facts.
