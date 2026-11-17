"""Insert window.MINDMAP_DATA into index.html with json.dumps (never an f-string)."""
import json, os, re
HERE = os.path.dirname(os.path.abspath(__file__))
P = os.path.join(HERE, "..", "index.html")
S = [
    ("01-when-the-question-is-about-relationships.html", "Questions about\nrelationships", "#34D399",
     ["Entity, relation, hop", "Join depth is the tell", "What chunks miss"]),
    ("02-nodes-edges-and-two-models.html", "Nodes, edges,\ntwo models", "#34D399",
     ["Property graph", "RDF triples and IRIs", "Wikidata statements"]),
    ("03-cypher-and-sparql-side-by-side.html", "Cypher and\nSPARQL", "#FBBF24",
     ["MATCH patterns", "Property paths", "Same question, twice"]),
    ("04-the-multi-hop-lab.html", "The multi-hop\nlab", "#FB923C",
     ["Graph vs chunks", "Recall by hop depth", "The missing edge"]),
    ("05-paths-centrality-communities.html", "Paths and\ncentrality", "#FB923C",
     ["Shortest paths", "Centrality measures", "Communities"]),
    ("06-graphrag-when-the-graph-feeds-the-llm.html", "GraphRAG", "#F87171",
     ["Community summaries", "Text-to-Cypher", "Graph, vectors or both"]),
]
data = {"title": "Knowledge\nGraphs", "centerColor": "#002B25", "sessions": [
    {"label": lab, "href": "courses/" + f, "color": col,
     "concepts": [{"label": c, "href": "courses/" + f} for c in cs]} for f, lab, col, cs in S]}
for f, lab, col, cs in S:
    for c in cs:
        assert len(c) <= 24, c
s = open(P).read()
blob = json.dumps(data, indent=2, ensure_ascii=False)
s = re.sub(r"window\.MINDMAP_DATA = .*?;\n</script>", lambda m: "window.MINDMAP_DATA = " + blob + ";\n</script>", s, flags=re.S)
open(P, "w").write(s)
print("mindmap nodes", 1 + len(S) + sum(len(x[3]) for x in S))
