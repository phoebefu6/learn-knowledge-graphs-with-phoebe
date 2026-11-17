"""Compare python reference vs node engine BY VALUE (never a text diff). Exit 1 on any mismatch.
Integers, strings and booleans must match exactly; floats within 2e-9 (both sides round to 9 places).
Usage: python3 materials/compare-ladder.py py.json node.json"""
import json, sys
a, b = json.load(open(sys.argv[1])), json.load(open(sys.argv[2]))
n, bad = 0, []
def walk(x, y, p):
    global n
    if isinstance(x, dict):
        if not isinstance(y, dict) or set(x) != set(y): bad.append(p + " keys differ"); return
        for k in x: walk(x[k], y[k], p + "/" + k)
    elif isinstance(x, list):
        if not isinstance(y, list) or len(x) != len(y): bad.append(p + " len"); return
        for i, (u, v) in enumerate(zip(x, y)): walk(u, v, p + "[%d]" % i)
    else:
        n += 1
        if isinstance(x, float) or isinstance(y, float):
            if isinstance(x, bool) or isinstance(y, bool) or abs(x - y) > 2e-9: bad.append("%s py=%r node=%r" % (p, x, y))
        elif x != y or type(x) != type(y): bad.append("%s py=%r node=%r" % (p, x, y))
walk(a, b, "")
print("values compared", n, "mismatches", len(bad))
for m in bad[:5]: print("  ", m)
sys.exit(1 if bad else 0)
