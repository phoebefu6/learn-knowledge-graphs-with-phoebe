# Agent brief - shared by every fan-out page of learn-knowledge-graphs-with-phoebe

You are writing ONE static HTML session page. No servers, no npm. **If your target file already
exists on disk, do not write it; report that and stop.** Write the file, return its path and one
line of coverage. No HTML in your reply. Mention in your reply any source you read that is not in
the source map, and any contradiction you found with another page.

## Read first, in this order

1. The template page. Copy its structure, classes, SVG grammar and quiz markup EXACTLY, including
   4 options per quiz question:
   `/Users/phoebe.fu/Documents/claude_work/github_repo/learn-knowledge-graphs-with-phoebe/courses/01-when-the-question-is-about-relationships.html`
   For rhythm on a widget page also skim `.../courses/04-the-multi-hop-lab.html` (same folder).
2. The source map, every canon number: `/Users/phoebe.fu/Documents/claude_work/github_repo/learn-knowledge-graphs-with-phoebe/materials/official-course-map.md`
   and the verified facts with tiers: `/Users/phoebe.fu/Documents/claude_work/github_repo/learn-knowledge-graphs-with-phoebe/materials/sources-verified.md`.
   Use ONLY their numbers and facts; never invent a statistic; a [reported] fact is said as
   reported; if a fact is missing, teach the uncertainty.
3. The stylesheet `:root` block: `/Users/phoebe.fu/Documents/claude_work/github_repo/learn-knowledge-graphs-with-phoebe/assets/style.css` (first 30 lines).

## Page skeleton (keep every component)

toolbar (crumb EXACTLY `<a href="../index.html">learn-knowledge-graphs-with-phoebe</a> / Session N of 6`,
#toggle-all, #zoom-toggle) · masthead (eyebrow "Learn Knowledge Graphs with Phoebe · Session N of 6",
h1 with one `<span class="accent">`, .sub, .chip-row with the level chip (🟢 Foundations / 🟡 Core /
🟠 Applied / 🔴 Capstone), `<span class="chip audience">Data and ML engineers</span>`, time chip
"45 min", .agenda a1-a4 with flex 1/4/5/1) · main.wrap · section#intro (Part 0: kicker, .lede,
.legend pills as in 01, a `.callout.example` with `span.ex-pill` "Constructed Vellum example",
`.callout.win` "★ What you walk out with tonight.") · 3 Parts, each `section.section#part-N` with
section-kicker (klabel "Part N · covers ...", h2, `.tag.concept "5 min live"`), a `.lede`, ONE
figure, `details.card` accordions (summary: `.mode.live` or `.mode.self`, title, `.mini`,
`.caret ▶`), and a `.callout.example` with `span.ex-pill` "Real world" · section#demo-1 Build-along
(kicker `.tag.demo "★ 22 min · everyone builds"`, .lede, ONE figure, `.steps > .step`, each with a
`.prompt-box.good` carrying a `span.label`) · section#exercise Homework (ol, 4 items) ·
section#quiz (3 x `.quiz-q data-answer="0-based"`, `p.qtext`, 4 `button.qopt` "A · ...",
`p.qwhy`; one `p.quiz-score`) · section#official, h2 EXACTLY "What this session teaches, and where
it came from", `.covered > .covered-row` (pill solid ✓ / light ◐ + name + note), then the `.mono`
line EXACTLY "Every fact on this page, and its verification tier, is recorded in the course's source
map." · section.cheat#cheatsheet (h3 "Session N cheat sheet <span>· pin this</span>", .grid-2 of
six .cheat-item) · `.callout.next` with `.nx-pill` "Next session" · footer.pagefoot · scripts
exactly as in 01: `../assets/kgr-sample.js?v=1`, `../assets/kgr-live.js?v=3`, `../assets/app.js?v=1`.

Head: the template's social meta block with this page's own title/description/url (og:image stays
assets/og-cover.png); `<title>Session N · <Title> - learn knowledge graphs with phoebe</title>`;
`<link rel="stylesheet" href="../assets/style.css?v=2">`. Nothing else external.

First `details.card` in Part 1 is `open`; the first card of other Parts may be open too, as in 01.
Sentence case headings. Warm practitioner voice, concrete. Inside prompt-boxes escape `&` `<` `>`
(Cypher arrows become `-&gt;` and `&lt;-`). Depth like 01 (450 to 650 lines is guidance, never a
target).

## Hard rules (a violation is rework)

- NEVER an em dash or en dash anywhere (prose, code, aria-labels, comments). Hyphen only.
- No meta text: never "this course", "in this course", "the course teaches". The two exact estate
  phrases above are the only self-references; "session 5" cross-references are fine.
- Attribution "by Phoebe Fu". Never "built with" a tool.
- No cross marks anywhere (✗ ✘ ✕ ❌ ×). Label states in words ("not found", "missing").
- Never "lottery"/"lotteries". English words only.
- Every number comes from the map or sources-verified, or is printed by a widget on the page.
  SPARQL or Cypher you show but the page cannot run: never print an invented output; say "run it
  at query.wikidata.org" or "in Neo4j" as Self-study.
- Contested evidence (GraphRAG gains): teach the disagreement; never resolve it.
- Vellum Press is constructed: label "Constructed Vellum example" every time. The data is real
  Wikidata (CC0). Never use any real employer, client or project of the author.
- Titles, widget ids and classes must not collide with siblings: do not use the prefixes `mcl-`,
  `adc-`, `rfm-`; use only the `kgr-` widget classes that exist in style.css.

## Figure grammar (hand-drawn, every figure)

Palette, ONLY these hexes: accent #004238 · deep #002B25 · mid #0B5F52 · soft #A8D8CE · tint
#E9F5F2 · ink #11211E · muted #475B57 · faint #C2D5D0 · hairline #DCE8E5 · honey (warm fill, behind
ink text only) #F4B860 · honey-ink (warm text) #6A4300 · honey-tint #FDF2E0 · #FFFFFF · universal
reds #991B1B #FEF2F2 #FCA5A5 only for a wrong-way or failure panel.

- `<figure class="zoomable">` > `<svg viewBox="0 0 880 H" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="the data, not the shape">`
  > `<defs>` + `<style>` + content, then `<figcaption>🔍 Click to zoom - takeaway</figcaption>`.
  Grow H, never W.
- Prefix unique per figure, used for every class and id: `k<session><letter>` (k2a, k2b, k2c,
  k2d; k3a...; k5a...; k6a...). Never reuse k1x or k4x.
- `<defs>` holds the wobble filter `id="PSk"` (copy 01's exactly, change seed), optional hachure
  `id="PHc"` (accent line), open arrowhead marker `id="PAr"` (ink). ALL shapes sit inside ONE
  `<g filter="url(#PSk)" fill="none" stroke="#11211E" stroke-width="2" stroke-linecap="round"
  stroke-linejoin="round">`; rects carry a small rotation (-2 to 2 degrees for items, under 1 for
  panels). Fills: white, tint, hachure for "the data", honey ONLY for the one thing the figure is
  about. Text classes: H 800 12px ink heading · L 600 12px ink · S 400 11px muted · P 800 11-12px deep
  · B 800 11px honey-ink · V 800 16-18px deep value · W 800 12px white ON A DEEP/ACCENT FILL ONLY ·
  N 400 12px muted note. Set fill in the class, never rely on the attribute.
- ALL `<text>` outside the filtered group, never below 10.5px.
- Fit: max chars ≈ (box width - 20) / 7 at 12px, (box width - 20) / 6.4 at 11px; full-width note
  under 110 chars; bottom note 22px below the last row, H clears it by 8px. No line, arrow or curve
  may cross a label. When in doubt, shorten.
- Draw the MECHANISM (a path being walked, a triple, a pattern matched, a hub short-circuiting),
  never a metaphor or decoration.
- No tick/cross glyphs in figures; write "found" / "not found".

## Cross-links (absolute URLs only)

- RAG builder pages: https://phoebefu6.github.io/learn-rag-with-phoebe/courses/b4-retrieval-basics.html ,
  b5-metadata-hybrid.html , b9-evaluation.html (same folder)
- Entity resolution: https://phoebefu6.github.io/learn-entity-resolution-with-phoebe/courses/01-no-shared-key.html
- Text-to-SQL schema linking: https://phoebefu6.github.io/learn-text-to-sql-with-phoebe/courses/b2-schema-linking.html
- Hub: https://phoebefu6.github.io/learn-with-phoebe/

## Footer and session titles

Footer left: "Session N of 6 · learn-knowledge-graphs-with-phoebe · by Phoebe Fu &nbsp;·&nbsp; 📚 <a href="https://phoebefu6.github.io/learn-with-phoebe/">Learn with Phoebe ↗</a>"
Footer right: `<a href="PREV">← Prev: Title</a> &nbsp;·&nbsp; <a href="NEXT">Next: Title →</a>` (session 6: "← Prev" and `<a href="../index.html">Course home</a>`).

1. `01-when-the-question-is-about-relationships.html` · When the question is about relationships
2. `02-nodes-edges-and-two-models.html` · Nodes, edges and two models
3. `03-cypher-and-sparql-side-by-side.html` · Cypher and SPARQL, side by side
4. `04-the-multi-hop-lab.html` · The multi-hop lab
5. `05-paths-centrality-communities.html` · Paths, centrality and communities
6. `06-graphrag-when-the-graph-feeds-the-llm.html` · GraphRAG: when the graph feeds the LLM

## Widgets you may embed (already built; never write your own script)

- Query box: `<div class="kgr-query">` with one or more `<template data-q="Button label">PATTERN</template>`
  children (escape `<` `>` as `&lt;` `&gt;` inside). The pattern subset: one linear chain,
  `(var:Label {name:"..."})`, `-[:TYPE]->`, `<-[:TYPE*m..n]-`, `RETURN var`. Labels Person,
  Institution, Country, Prize. Types WON, EDUCATED_AT, EMPLOYED_BY, ADVISED (advisor -> student),
  CITIZEN_OF. Names must be EXACT Wikidata labels as in the map (e.g. "Max Delbrück",
  "Joseph John Thomson", "University of Göttingen").
- Algorithm widget: `<div class="kgr-algo" data-mode="advisor" data-measure="degree"></div>`
  (modes advisor | full; measures degree | betweenness | pagerank | communities; it also has a
  shortest-path box defaulting to Esther Duflo -> Paul Samuelson).
- Only numbers in the map's CANON sections may be quoted for these widgets.
