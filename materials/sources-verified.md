# Sources verified - Learn Knowledge Graphs with Phoebe

Verified 2026-11-16. Tiers: [read-at-source] = read on the primary page or paper itself during this run; [reported] = seen only in a search result, catalogue or secondary page (where named). Tool doc versions read are noted per section.

## 1. Cypher (Neo4j Cypher Manual, openCypher)

Manual read: the "current" Cypher Manual, which is the Cypher 25 manual (version selector shows 25, 5, 4.4). The 5.9 fact comes from the Cypher 5 manual.

- MATCH uses ASCII-art patterns: nodes in parentheses with label and properties, relationships in brackets with a type and arrow, e.g. `MATCH (:Movie {title: 'Wall Street'})<-[:ACTED_IN]-(actor:Person) RETURN actor.name`. [read-at-source] https://neo4j.com/docs/cypher-manual/current/clauses/match/
- Variable-length relationship syntax: `-[*]->` is 1 or more hops, `-[*n]->` exactly n, `-[*m..n]->` m to n, `-[*..n]->` 1 to n, `-[*0..n]->` 0 to n; so `-[:R*1..3]->` means 1 to 3 hops. [read-at-source] https://neo4j.com/docs/cypher-manual/current/patterns/reference/variable-length-paths/
- In the old syntax a bare `*` defaults the lower bound to 1, so it is not a Kleene star. [read-at-source] https://neo4j.com/docs/cypher-manual/current/patterns/reference/variable-length-paths/
- Equivalence example: `(a)-[:KNOWS*3..5]->(b)` equals the quantified form `(a) (()-[:KNOWS]->()){3,5} (b)`. [read-at-source] https://neo4j.com/docs/cypher-manual/current/patterns/reference/variable-length-paths/
- Quantifiers for quantified path patterns and relationships: `{m,n}`, `{n}`, `{m,}`, `{,n}`, `+` (= {1,}), `*` (= {0,}). [read-at-source] https://neo4j.com/docs/cypher-manual/current/patterns/reference/variable-length-paths/
- Quantified path pattern example: `((:Stop)-[:NEXT]->(:Stop)){1,3}`; quantified relationship example: `-[:NEXT]->{1,10}`. [read-at-source] https://neo4j.com/docs/cypher-manual/current/patterns/variable-length-patterns/
- Variable-length relationships remain usable but the manual says "This syntax is still available but it is not GQL conformant." [read-at-source] https://neo4j.com/docs/cypher-manual/current/patterns/variable-length-patterns/
- Quantified path patterns and quantified relationships were introduced in Neo4j 5.9: "Prior to the introduction of quantified path patterns and quantified relationships in Neo4j 5.9". [read-at-source] https://neo4j.com/docs/cypher-manual/5/patterns/variable-length-paths/
- Shortest paths use the `SHORTEST k`, `ALL SHORTEST`, `ANY` and `SHORTEST k GROUPS` keywords, e.g. `MATCH p = SHORTEST 1 (a)-[:LINK]-+(b)`. [read-at-source] https://neo4j.com/docs/cypher-manual/current/patterns/shortest-paths/
- `SHORTEST` "functionally replaces and extends" `shortestPath()` and `allShortestPaths()`; both functions "can still be used, but they are not GQL conformant." [read-at-source] https://neo4j.com/docs/cypher-manual/current/patterns/shortest-paths/
- `k` in `SHORTEST k` can be a parameter as of Neo4j 2025.06. The page does not state which version introduced `SHORTEST` itself. [read-at-source] https://neo4j.com/docs/cypher-manual/current/patterns/shortest-paths/
- Cypher 25 adds paths with repeated nodes and relationships (introduced Neo4j 2025.06) and acyclic paths (introduced Neo4j 2026.03), both "Cypher 25 only". [read-at-source] https://neo4j.com/docs/cypher-manual/current/patterns/reference/
- openCypher states its specification "evolves towards ISO/IEC 39075 GQL." [read-at-source] https://opencypher.org/
- Neo4j's CTO is quoted saying Cypher users are "already 95% there" for GQL (vendor claim). [reported - search snippet of The New Stack] https://thenewstack.io/gql-a-new-iso-standard-for-querying-graph-databases/
- GQL uses INSERT where Cypher uses CREATE. [reported - search snippet of The New Stack] https://thenewstack.io/gql-a-new-iso-standard-for-querying-graph-databases/

## 2. GQL (ISO/IEC 39075) and SQL/PGQ (ISO/IEC 9075-16)

- ISO/IEC 39075:2024 "Information technology - Database languages - GQL", edition 1.0, publication date 2024-04-12, International Standard. [read-at-source - IEC webstore; iso.org returned 403] https://webstore.iec.ch/publication/94107
- It defines data structures and operations on property graphs (creating, querying, maintaining, controlling) and a language to define and modify them, for portability across GQL implementations. [read-at-source - IEC webstore abstract] https://webstore.iec.ch/publication/94107
- ISO's own catalogue page for ISO/IEC 39075:2024 (standard 76120). [reported - iso.org blocked automated fetch] https://www.iso.org/standard/76120.html
- Developed by ISO/IEC JTC 1/SC 32; about 610 pages. [reported - catalogue search results] https://webstore.iec.ch/publication/94107
- ISO/IEC 9075-16:2023 "SQL - Part 16: Property Graph Queries (SQL/PGQ)", published June 2023, first edition; defines how SQL represents and queries property graphs. [reported - SCC and BSI catalogue snippets; iso.org and scc-ccn.ca returned 403] https://www.iso.org/standard/79473.html

## 3. RDF and SPARQL (W3C)

- RDF 1.1 Primer is a W3C Working Group Note dated 24 June 2014. [read-at-source] https://www.w3.org/TR/rdf11-primer/
- A triple is a statement with subject, predicate, object; "An RDF statement expresses a relationship between two resources." [read-at-source] https://www.w3.org/TR/rdf11-primer/
- "An IRI identifies a resource"; IRIs are global identifiers others can reuse. [read-at-source] https://www.w3.org/TR/rdf11-primer/
- "Literals are basic values that are not IRIs"; they "may only appear in the object position of a triple." [read-at-source] https://www.w3.org/TR/rdf11-primer/
- Blank nodes are resources without a global identifier, "like simple variables in algebra"; they can be subject or object. [read-at-source] https://www.w3.org/TR/rdf11-primer/
- RDF 1.2 Concepts is a W3C Candidate Recommendation Draft dated 16 November 2026 (not yet a Recommendation). [read-at-source] https://www.w3.org/TR/rdf12-concepts/
- RDF 1.2 adds triple terms: a triple can be used "as a triple term, in the object position of another triple." [read-at-source] https://www.w3.org/TR/rdf12-concepts/
- SPARQL 1.1 Query Language is a W3C Recommendation dated 21 March 2013. [read-at-source] https://www.w3.org/TR/sparql11-query/
- "Basic graph patterns are sets of triple patterns." [read-at-source] https://www.w3.org/TR/sparql11-query/
- Property paths: `p+` one or more, `p*` zero or more, `p?` zero or one, `p/q` sequence, `^p` inverse, `p|q` alternative. [read-at-source] https://www.w3.org/TR/sparql11-query/

## 4. Wikidata

- Items are identified by a Q-prefixed id ("Each item has a unique identifier (starting with a Q prefix)"); properties carry P-ids, e.g. instance of (P31). [read-at-source] https://www.wikidata.org/wiki/Help:Items
- Items have labels, descriptions, aliases, statements and sitelinks. [read-at-source] https://www.wikidata.org/wiki/Help:Items
- "A statement consists of a property-value pair." [read-at-source] https://www.wikidata.org/wiki/Help:Statements
- Qualifiers "further describe or refine the value of a property given in a statement." [read-at-source] https://www.wikidata.org/wiki/Help:Statements
- References "point to specific sources that back up the data provided in a statement." [read-at-source] https://www.wikidata.org/wiki/Help:Statements
- Ranks: preferred (most current, best consensus), normal ("assigned to all statements by default"), deprecated (statements "known to include errors"). [read-at-source] https://www.wikidata.org/wiki/Help:Ranking
- Structured data in the main, Property and Lexeme namespaces is "available under the Creative Commons CC0 License"; text in other namespaces is CC BY-SA. [read-at-source] https://www.wikidata.org/wiki/Wikidata:Copyright
- The public Wikidata Query Service has a hard query deadline "set to 60 seconds." [read-at-source] https://www.mediawiki.org/wiki/Wikidata_Query_Service/User_Manual
- Each client (user agent plus IP) gets 60 seconds of processing time per 60-second window, 30 error queries per minute, 5 parallel queries per IP; over-limit clients get HTTP 429 with Retry-After. [read-at-source] https://www.mediawiki.org/wiki/Wikidata_Query_Service/User_Manual
- Query endpoint: query.wikidata.org (named in the WDQS user manual). [read-at-source] https://www.mediawiki.org/wiki/Wikidata_Query_Service/User_Manual
- Wikimedia User-Agent policy: scripts must send a descriptive User-Agent with "some way of contacting you, the operator"; generic or missing agents get HTTP 403 and "may be blocked without notice." [read-at-source] https://foundation.wikimedia.org/wiki/Policy:Wikimedia_Foundation_User-Agent_Policy
- Property and item labels confirmed via the Wikidata API: P166 award received, P69 educated at, P108 employer, P184 doctoral advisor, P185 doctoral student, P27 country of citizenship, P585 point in time, P31 instance of, P279 subclass of, Q7191 Nobel Prize. [read-at-source] https://www.wikidata.org/w/api.php?action=wbgetentities&ids=P166|P69|P108|P184|P185|P27|P585|P31|P279|Q7191&props=labels&languages=en&format=json
- `wdt:` = truthy direct link from entity to value ("Truthy assertions about the data, links entity to value directly"). [read-at-source] https://www.mediawiki.org/wiki/Wikibase/Indexing/RDF_Dump_Format
- Truthy = statements with the best non-deprecated rank: preferred if any exist, otherwise normal; qualifiers ignored. [read-at-source] https://www.mediawiki.org/wiki/Wikibase/Indexing/RDF_Dump_Format
- `p:` links entity to statement node, `ps:` links statement to its main value, `pq:` links statement to a qualifier value, `pr:` reference values, references via `prov:wasDerivedFrom`. [read-at-source] https://www.mediawiki.org/wiki/Wikibase/Indexing/RDF_Dump_Format

## 5. Hogan et al. 2021, Knowledge Graphs (ACM Computing Surveys)

Read from the arXiv PDF (v6, September 2021).

- Published in ACM Computing Surveys 54(4), article 71, 2021, DOI 10.1145/3447772; 18 authors led by Aidan Hogan. [read-at-source] https://arxiv.org/abs/2003.02320
- Definition: a knowledge graph is "a graph of data intended to accumulate and convey knowledge of the real world", whose nodes are entities and edges are relations between them (Section 1, they call it an inclusive definition). [read-at-source] https://arxiv.org/abs/2003.02320
- Directed edge-labelled graph (aka multi-relational graph): a set of nodes and a set of directed labelled edges between them (Section 2.1.1). [read-at-source] https://arxiv.org/abs/2003.02320
- Heterogeneous graph: "each node and edge is assigned one type"; node type is part of the model rather than a special relation (Section 2.1.2). [read-at-source] https://arxiv.org/abs/2003.02320
- Property graph: "allows a set of property-value pairs and a label to be associated with both nodes and edges" (Section 2.1). [read-at-source] https://arxiv.org/abs/2003.02320
- Open World Assumption: under OWA, absence of an edge does not mean it is false, since it "could be part of some knowledge not (yet) described by the graph"; Closed World Assumption treats unknown as false. [read-at-source] https://arxiv.org/abs/2003.02320
- Deductive knowledge (Section 4): precise logical consequences derived from data plus rules/ontologies (e.g. inference rules with body and head as graph patterns). [read-at-source] https://arxiv.org/abs/2003.02320
- Inductive knowledge (Section 5): generalising patterns from observations to make "novel but potentially imprecise predictions"; covers graph analytics, embeddings, GNNs, rule and axiom mining. [read-at-source] https://arxiv.org/abs/2003.02320

## 6. Edge et al. 2024, GraphRAG (Microsoft Research)

Read from the arXiv PDF (v2, revised 19 February 2025).

- Pipeline: chunk source docs, LLM extracts entities, relationships and claims into a graph index, community detection partitions it, LLM writes community summaries, queries answered by map-reduce over summaries. [read-at-source] https://arxiv.org/abs/2404.16130
- Community detection is Leiden (Traag et al. 2019) applied hierarchically until leaf communities; implemented with the graspologic library. [read-at-source] https://arxiv.org/abs/2404.16130
- Map step: each community summary gives a partial answer in parallel; reduce step combines partial answers into the global answer. [read-at-source] https://arxiv.org/abs/2404.16130
- Target: global sensemaking questions over a whole corpus (e.g. main themes), which conventional vector RAG handles poorly. [read-at-source] https://arxiv.org/abs/2404.16130
- Datasets: Podcast transcripts (Behind the Tech), 1669 x 600-token chunks, 100-token overlap, about 1 million tokens; News articles, 3197 x 600-token chunks, about 1.7 million tokens. [read-at-source] https://arxiv.org/abs/2404.16130
- Conditions compared: GraphRAG at four community levels C0-C3, map-reduce over source text (TS), and vector RAG semantic search (SS); 125 questions per comparison, each repeated five times. [read-at-source] https://arxiv.org/abs/2404.16130
- Criteria: comprehensiveness, diversity, empowerment, and directness (directness used as a validity check). LLM judge does head-to-head comparisons. [read-at-source] https://arxiv.org/abs/2404.16130
- Comprehensiveness win rates vs vector RAG: 72-83% (Podcast) and 72-80% (News); diversity: 75-82% (Podcast) and 62-71% (News). [read-at-source] https://arxiv.org/abs/2404.16130
- Vector RAG produced the most direct answers in all comparisons; empowerment results were mixed. [read-at-source] https://arxiv.org/abs/2404.16130
- Token cost: vs source-text summarisation, C3 needed 26-33% fewer context tokens and root-level C0 "over 97% fewer tokens", while keeping 72% comprehensiveness and 62% diversity win rates over vector RAG. [read-at-source] https://arxiv.org/abs/2404.16130
- Indexing cost: graph indexing with 600-token chunks took 281 minutes for the Podcast dataset using gpt-4-turbo; 8k-token context window for summaries and answers. [read-at-source] https://arxiv.org/abs/2404.16130
- Chunk size trade-off: GPT-4 extracted almost twice as many entity references at 600-token chunks as at 2400 tokens (HotpotQA sample). [read-at-source] https://arxiv.org/abs/2404.16130
- Authors' stated limitation: evaluation covered only two corpora of about 1 million tokens each. [read-at-source] https://arxiv.org/abs/2404.16130
- LazyGraphRAG (Microsoft Research blog, 25 November 2024): indexing costs "identical to vector RAG and 0.1% of the costs of full GraphRAG." [read-at-source] https://www.microsoft.com/en-us/research/blog/lazygraphrag-setting-a-new-standard-for-quality-and-cost/
- LazyGraphRAG uses NLP noun-phrase extraction instead of LLM extraction at index time and defers LLM use to query time; comparable global-query quality to GraphRAG Global Search at "more than 700 times lower query cost." [read-at-source] https://www.microsoft.com/en-us/research/blog/lazygraphrag-setting-a-new-standard-for-quality-and-cost/

## 7. Evaluations that qualify GraphRAG gains, and multi-hop benchmarks

- Han et al. (arXiv 2502.11371, first Feb 2025, latest revision Nov 2026): "RAG excels on detailed single-hop queries" (NQ, NovelQA single-hop and detail subsets). [read-at-source] https://arxiv.org/abs/2502.11371
- Han et al.: GraphRAG methods "perform best on multi-hop QA benchmarks (HotPotQA and MultiHop-RAG)"; e.g. HippoRAG2 63.01 F1 vs RAG 60.04 on HotpotQA. [read-at-source] https://arxiv.org/html/2502.11371
- Han et al.: community global search can lose fine-grained evidence and hurt detail QA; KG-based GraphRAG generally underperforms due to limited graph coverage. [read-at-source] https://arxiv.org/html/2502.11371
- Han et al.: for summarisation, RAG is preferred for comprehensiveness and GraphRAG (Global) for diversity under LLM-as-judge. [read-at-source] https://arxiv.org/html/2502.11371
- Han et al.: "position bias is clearly present in LLM-as-a-Judge evaluations for summarization"; swapping answer order can flip verdicts. [read-at-source] https://arxiv.org/html/2502.11371
- Han et al.: selecting or combining RAG and GraphRAG per query gave consistent gains. [read-at-source] https://arxiv.org/abs/2502.11371
- Xiang et al. (arXiv 2506.05690, GraphRAG-Bench, v3 Feb 2026): notes recent studies find GraphRAG often underperforms vanilla RAG on many real-world tasks; benchmark spans fact retrieval, complex reasoning, contextual summarisation, creative generation. [read-at-source] https://arxiv.org/abs/2506.05690
- Xiang et al.: "basic RAG is comparable to or outperforms GraphRAG in simple fact retrieval tasks"; GraphRAG shows "a clear advantage in complex reasoning" and contextual summarisation. [read-at-source] https://arxiv.org/html/2506.05690
- Xiang et al.: GraphRAG "significantly increases prompt length"; MS-GraphRAG global around 4x10^4 tokens vs about 10^3 for HippoRAG2. [read-at-source] https://arxiv.org/html/2506.05690
- Zhou et al. (arXiv 2503.04338, v2 Apr 2026): puts graph-based RAG methods in one framework, benchmarks them on specific and abstract QA, and finds different recombined variants win on specific vs abstract questions. [read-at-source] https://arxiv.org/abs/2503.04338
- HotpotQA (Yang et al., EMNLP 2018): 113k Wikipedia QA pairs that "require finding and reasoning over multiple supporting documents", with sentence-level supporting facts. [read-at-source] https://arxiv.org/abs/1809.09600
- MuSiQue (Trivedi et al., TACL 2022): MuSiQue-Ans has "25K 2-4 hop questions" built by composing single-hop questions. [read-at-source] https://arxiv.org/abs/2108.00573

## 8. BM25

- Robertson and Zaragoza, Foundations and Trends in IR 3(4), 2009, pp. 333-389, DOI 10.1561/1500000019. [read-at-source] https://staff.city.ac.uk/~sbrp622/papers/foundations_bm25_review.pdf
- BM25 term weight (eq. 3.15): w = tf / (k1 * ((1 - b) + b * dl/avdl) + tf) * w_RSJ, summed over query terms; b = 1 is full length normalisation, b = 0 switches it off. [read-at-source] https://staff.city.ac.uk/~sbrp622/papers/foundations_bm25_review.pdf
- Note: their form omits the (k1 + 1) numerator factor seen in many textbook versions; it only rescales scores, ranking is unchanged (Section 3.5.1 says published versions vary). [read-at-source] https://staff.city.ac.uk/~sbrp622/papers/foundations_bm25_review.pdf
- Parameter guidance: experiments suggest "0.5 < b < 0.8 and 1.2 < k1 < 2" are reasonably good in many circumstances (Section 3.5). [read-at-source] https://staff.city.ac.uk/~sbrp622/papers/foundations_bm25_review.pdf
- IDF form without relevance info (eq. 3.3): w_IDF = log((N - n_i + 0.5) / (n_i + 0.5)). [read-at-source] https://staff.city.ac.uk/~sbrp622/papers/foundations_bm25_review.pdf
- Lucene BM25Similarity (9.12 javadoc): defaults k1 = 1.2, b = 0.75; idf "log(1 + (docCount - docFreq + 0.5)/(docFreq + 0.5))". [read-at-source] https://lucene.apache.org/core/9_12_0/core/org/apache/lucene/search/similarities/BM25Similarity.html
- Elasticsearch: BM25 is the default similarity; k1 "default value is 1.2", b "default value is 0.75". [read-at-source] https://www.elastic.co/docs/reference/elasticsearch/index-settings/similarity

## 9. Graph algorithms (networkx 3.7 docs) and their papers

- `shortest_path(G, source=None, target=None, weight=None, method='dijkstra')`; with weight=None every edge counts 1 and unweighted methods are used; returns a list if source and target given, dicts otherwise. [read-at-source] https://networkx.org/documentation/stable/reference/algorithms/generated/networkx.algorithms.shortest_paths.generic.shortest_path.html
- `degree_centrality`: fraction of nodes a node connects to, normalised by dividing by n - 1 (max possible degree in a simple graph). [read-at-source] https://networkx.org/documentation/stable/reference/algorithms/generated/networkx.algorithms.centrality.degree_centrality.html
- `betweenness_centrality(G, k=None, normalized=True, weight=None, endpoints=False, seed=None)`; normalised by (n-1)(n-2)/2 for undirected and (n-1)(n-2) for directed graphs (endpoints=False). [read-at-source] https://networkx.org/documentation/stable/reference/algorithms/generated/networkx.algorithms.centrality.betweenness_centrality.html
- `pagerank(G, alpha=0.85, personalization=None, max_iter=100, tol=1e-06, ...)`; alpha is the damping parameter. [read-at-source] https://networkx.org/documentation/stable/reference/algorithms/generated/networkx.algorithms.link_analysis.pagerank_alg.pagerank.html
- `label_propagation_communities(G)`: semi-synchronous label propagation (Cordasco and Gargano 2010); not implemented for directed graphs. [read-at-source] https://networkx.org/documentation/stable/reference/algorithms/generated/networkx.algorithms.community.label_propagation.label_propagation_communities.html
- `louvain_communities(G, weight='weight', resolution=1, threshold=1e-07, max_level=None, seed=None)`; output depends on a random shuffle unless seed is set. [read-at-source] https://networkx.org/documentation/stable/reference/algorithms/generated/networkx.algorithms.community.louvain.louvain_communities.html
- Louvain was added in networkx 2.7 (released 28 February 2022): "Added the Louvain community detection algorithm: louvain_communities and louvain_partitions". [read-at-source] https://networkx.org/documentation/stable/release/release_2.7.html
- `greedy_modularity_communities(G, weight=None, resolution=1, cutoff=1, best_n=None)`: Clauset-Newman-Moore greedy modularity maximisation (Phys. Rev. E 2004). [read-at-source] https://networkx.org/documentation/stable/reference/algorithms/generated/networkx.algorithms.community.modularity_max.greedy_modularity_communities.html
- PageRank: Page, Brin, Motwani, Winograd, "The PageRank Citation Ranking: Bringing Order to the Web", Stanford InfoLab Technical Report 1999-66 (November 1999). [reported - bibliographic search results; ilpubs.stanford.edu failed TLS] http://ilpubs.stanford.edu:8090/422/
- Louvain: Blondel et al., J. Stat. Mech. (2008) P10008; tested on a 2.6 million customer phone network and a web graph of 118 million nodes. [read-at-source] https://arxiv.org/abs/0803.0476
- Leiden: Traag, Waltman, van Eck, Scientific Reports 9, 5233 (2019); Louvain "may yield arbitrarily badly connected communities", Leiden guarantees connected communities and is faster. [read-at-source] https://arxiv.org/abs/1810.08473

## 10. Text-to-Cypher

- Neo4j's Text2Cypher paper (Ozsoy et al., arXiv 2412.10064, December 2024) combines and cleans public datasets into 44,387 instances and reports gains from fine-tuning in Google-BLEU and Exact Match. [read-at-source] https://arxiv.org/abs/2412.10064
- Dataset neo4j/text2cypher-2024v1 on Hugging Face, licence apache-2.0. [read-at-source] https://huggingface.co/datasets/neo4j/text2cypher-2024v1
- Train/test split 39,554 / 4,833. [reported - search snippet of the dataset card] https://huggingface.co/datasets/neo4j/text2cypher-2024v1
- LangChain GraphCypherQAChain security note: use "credentials that are narrowly-scoped to only include necessary permissions"; broad credentials risk data corruption, loss or exposure. [read-at-source] https://reference.langchain.com/python/langchain-neo4j/chains/graph_qa/cypher/GraphCypherQAChain
- `allow_dangerous_requests` defaults to False and the chain raises an error unless set True (forced opt-in). [reported - search snippet of the langchain_neo4j source] https://reference.langchain.com/python/langchain-neo4j/chains/graph_qa/cypher/GraphCypherQAChain/allow_dangerous_requests

## 11. Neo4j Desktop and Aura Free

- AuraDB Free limits: 200,000 nodes, 400,000 relationships, 1GB storage. [read-at-source] https://neo4j.com/docs/aura/quotas-and-limits/
- Neo4j pricing page: AuraDB Free needs no credit card, has "Limits on node and relationship counts" and auto-pause/resume (no inactivity period stated). [read-at-source] https://neo4j.com/pricing/
- Older Neo4j pages still quote 50,000 nodes / 175,000 relationships for Aura Free; the quotas page above is the current figure. [reported - search results, FAQ and 2021 blog] https://neo4j.com/blog/announcing-early-access-neo4j-aura-free-tier/
- Neo4j Desktop is free ("Free. Get Started Today.") and includes Neo4j Graph Database Enterprise Edition for Developers, on Linux, Mac and Windows. [read-at-source] https://neo4j.com/download/

## Citation appendix

- Blondel, V. D., Guillaume, J.-L., Lambiotte, R., Lefebvre, E. (2008). Fast unfolding of communities in large networks. Journal of Statistical Mechanics P10008. https://arxiv.org/abs/0803.0476
- Edge, D., Trinh, H., Cheng, N., Bradley, J., Chao, A., Mody, A., Truitt, S., Metropolitansky, D., Ness, R. O., Larson, J. (2024). From Local to Global: A Graph RAG Approach to Query-Focused Summarization. arXiv (Microsoft Research). https://arxiv.org/abs/2404.16130
- Elastic (2026). Similarity settings. Elasticsearch reference documentation. https://www.elastic.co/docs/reference/elasticsearch/index-settings/similarity
- Han, H., Ma, L., Wang, Y., Shomer, H., Lei, Y., Qi, Z., Guo, K., Hua, Z., Long, B., Liu, H., Aggarwal, C. C., Tang, J. (2025). RAG vs. GraphRAG: A Systematic Evaluation and Key Insights. arXiv. https://arxiv.org/abs/2502.11371
- Hogan, A., Blomqvist, E., Cochez, M., d'Amato, C., de Melo, G., Gutierrez, C., et al. (2021). Knowledge Graphs. ACM Computing Surveys 54(4). https://arxiv.org/abs/2003.02320
- IEC / ISO (2024). ISO/IEC 39075:2024 Information technology - Database languages - GQL. ISO/IEC JTC 1/SC 32. https://webstore.iec.ch/publication/94107
- ISO / IEC (2023). ISO/IEC 9075-16:2023 Information technology - Database languages SQL - Part 16: Property Graph Queries (SQL/PGQ). ISO. https://www.iso.org/standard/79473.html
- LangChain (2026). GraphCypherQAChain. LangChain Python reference (langchain-neo4j). https://reference.langchain.com/python/langchain-neo4j/chains/graph_qa/cypher/GraphCypherQAChain
- Apache Lucene (2024). BM25Similarity, Lucene Core 9.12.0 API. Apache Software Foundation. https://lucene.apache.org/core/9_12_0/core/org/apache/lucene/search/similarities/BM25Similarity.html
- Microsoft Research (2024). LazyGraphRAG: Setting a new standard for quality and cost. Microsoft Research Blog. https://www.microsoft.com/en-us/research/blog/lazygraphrag-setting-a-new-standard-for-quality-and-cost/
- Neo4j (2026). Cypher Manual (Cypher 25): Variable-length paths, Shortest paths, MATCH. Neo4j documentation. https://neo4j.com/docs/cypher-manual/current/
- Neo4j (2026). Cypher Manual (Cypher 5): Variable-length paths. Neo4j documentation. https://neo4j.com/docs/cypher-manual/5/patterns/variable-length-paths/
- Neo4j (2026). AuraDB quotas and limits. Neo4j documentation. https://neo4j.com/docs/aura/quotas-and-limits/
- Neo4j (2026). Neo4j pricing. Neo4j. https://neo4j.com/pricing/
- Neo4j (2026). Neo4j Desktop download. Neo4j. https://neo4j.com/download/
- NetworkX developers (2026). NetworkX 3.7 documentation (shortest_path, degree_centrality, betweenness_centrality, pagerank, label_propagation_communities, louvain_communities, greedy_modularity_communities). NetworkX. https://networkx.org/documentation/stable/
- NetworkX developers (2022). NetworkX 2.7 release notes. NetworkX. https://networkx.org/documentation/stable/release/release_2.7.html
- openCypher (2026). What is openCypher? openCypher project. https://opencypher.org/
- Ozsoy, M. G., Messallem, L., Besga, J., Minneci, G. (2024). Text2Cypher: Bridging Natural Language and Graph Databases. arXiv (Neo4j). https://arxiv.org/abs/2412.10064
- Page, L., Brin, S., Motwani, R., Winograd, T. (1999). The PageRank Citation Ranking: Bringing Order to the Web. Stanford InfoLab Technical Report 1999-66. http://ilpubs.stanford.edu:8090/422/
- Robertson, S., Zaragoza, H. (2009). The Probabilistic Relevance Framework: BM25 and Beyond. Foundations and Trends in Information Retrieval 3(4). https://staff.city.ac.uk/~sbrp622/papers/foundations_bm25_review.pdf
- Traag, V. A., Waltman, L., van Eck, N. J. (2019). From Louvain to Leiden: guaranteeing well-connected communities. Scientific Reports 9, 5233. https://arxiv.org/abs/1810.08473
- Trivedi, H., Balasubramanian, N., Khot, T., Sabharwal, A. (2022). MuSiQue: Multihop Questions via Single-hop Question Composition. Transactions of the ACL. https://arxiv.org/abs/2108.00573
- W3C (2014). RDF 1.1 Primer. W3C Working Group Note. https://www.w3.org/TR/rdf11-primer/
- W3C (2026). RDF 1.2 Concepts and Abstract Data Model. W3C Candidate Recommendation Draft. https://www.w3.org/TR/rdf12-concepts/
- W3C (2013). SPARQL 1.1 Query Language. W3C Recommendation. https://www.w3.org/TR/sparql11-query/
- Wikidata (2026). Help:Items, Help:Statements, Help:Ranking, Wikidata:Copyright. Wikidata. https://www.wikidata.org/wiki/Help:Statements
- Wikimedia (2026). Wikidata Query Service User Manual; Wikibase RDF Dump Format. MediaWiki. https://www.mediawiki.org/wiki/Wikidata_Query_Service/User_Manual
- Wikimedia Foundation (2026). Wikimedia Foundation User-Agent Policy. Wikimedia Foundation. https://foundation.wikimedia.org/wiki/Policy:Wikimedia_Foundation_User-Agent_Policy
- Xiang, Z., Wu, C., Zhang, Q., Chen, S., Hong, Z., Huang, X., Su, J. (2025). When to use Graphs in RAG: A Comprehensive Analysis for Graph Retrieval-Augmented Generation. arXiv. https://arxiv.org/abs/2506.05690
- Yang, Z., Qi, P., Zhang, S., Bengio, Y., Cohen, W. W., Salakhutdinov, R., Manning, C. D. (2018). HotpotQA: A Dataset for Diverse, Explainable Multi-hop Question Answering. EMNLP. https://arxiv.org/abs/1809.09600
- Zhou, Y., Su, Y., Sun, Y., Wang, S., Wang, T., He, R., et al. (2025). In-depth Analysis of Graph-based RAG in a Unified Framework. arXiv. https://arxiv.org/abs/2503.04338
