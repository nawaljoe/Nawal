"""Gabung calon potongan: gagap.json (spektrum) + tempoh perkataan berlebihan + jeda + potongan manual.
Guna: [POTONG_MANUAL=manual.json] calon_potong.py perkataan.txt gagap.json a-b [a-b ...] > calon.json"""
import json, os, re, sys

words = []
for l in open(sys.argv[1]):
    a, b, t = l.split(None, 2)
    words.append((float(a), float(b), t.strip()))
spec = json.load(open(sys.argv[2]))
ranges = [tuple(map(float, r.split('-'))) for r in sys.argv[3:]]
cuts = [[a, b, 'spektrum'] for a, b, *_ in spec]
for i in range(len(words) - 1):
    s, e, t = words[i]
    ns = words[i + 1][0]
    if not any(r0 <= s and ns <= r1 for r0, r1 in ranges):
        continue
    real = 0.14 * max(1, len(re.findall(r'[aeiou]', t.lower()))) + 0.12
    if e - s > real + 0.35:
        cuts.append([round(s + real + 0.06, 2), round(ns - 0.08, 2), f'meleret:{t}'])
    elif ns - e > 0.35:
        cuts.append([round(e + 0.05, 2), round(ns - 0.07, 2), f'jeda:{t}'])
# Potongan manual (ulangan / mula palsu yang dikenal pasti dari transkrip): fail JSON [[mula, tamat, "sebab"], ...]
MANUAL = json.load(open(os.environ["POTONG_MANUAL"])) if os.environ.get("POTONG_MANUAL") else []
cuts += MANUAL
cuts = [c for c in cuts if c[1] - c[0] >= 0.2]
cuts.sort()
merged = []
for c in cuts:
    if merged and c[0] <= merged[-1][1] + 0.05:
        merged[-1][1] = max(merged[-1][1], c[1]); merged[-1][2] += '+' + c[2]
    else:
        merged.append(list(c))
print(json.dumps(merged))
