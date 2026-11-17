<!-- learn-with-phoebe hub banner -->
> ### 📚 Part of [**Learn with Phoebe**](https://phoebefu6.github.io/learn-with-phoebe/)
> The shelf of 201 free, hands-on courses on AI, data, and the craft around them. **[Browse every course ↗](https://phoebefu6.github.io/learn-with-phoebe/)**
<!-- /learn-with-phoebe hub banner -->

# Learn Knowledge Graphs with Phoebe

Six 45-minute sessions for data and ML engineers who know SQL and the basics of RAG. Entities and
relations as a graph, queries over it, graph algorithms, and graph-based retrieval: find the
questions only a graph can answer, and when a GraphRAG is worth its cost.

1. When the question is about relationships
2. Nodes, edges and two models: property graph and RDF
3. Cypher and SPARQL, side by side
4. The multi-hop lab (the bench)
5. Paths, centrality and communities
6. GraphRAG: when the graph feeds the LLM

The running case, Vellum Press, is a constructed academic publisher. Its graph is real: a Wikidata
extract (CC0) around Nobel laureates, their doctoral advisors, institutions and citizenship, fetched
2026-11-16. Every number on the bench is computed in the browser; `materials/kgr_reference.py`
reproduces each one and `materials/compare-ladder.py` checks the two by value.

Static HTML, no build step, no account needed. Open `index.html`.

By Phoebe Fu.
