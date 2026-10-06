// Unit check for the answer guard (runs without an API key).
// node --experimental-strip-types scripts/guard-test.mts
import { unsupportedClaims, unsupportedNumbers } from "../src/lib/retrieve.ts";

const ctx = `[1] VeraScan (project)
Python package that detects train/eval data contamination with 4 checks: exact match, 13-gram overlap, fuzzy match and semantic similarity. Published on PyPI: pip install verascan.`;

const cases: [string, string, boolean][] = [
  ["good", "Balamurugan shipped VeraScan, a Python package on PyPI (pip install verascan) with 4 checks including 13-gram overlap.", true],
  ["invented paper", "VeraScan was accompanied by a paper at NeurIPS describing the method.", false],
  ["invented arxiv", "See the arXiv preprint for VeraScan.", false],
  ["invented metric", "VeraScan catches 97% of contaminated samples.", false],
  ["invented downloads", "VeraScan has over 1,000 downloads.", false],
];
let fail = 0;
for (const [name, ans, shouldPass] of cases) {
  const bad = [...unsupportedNumbers(ans, ctx), ...unsupportedClaims(ans, ctx)];
  const passed = bad.length === 0;
  const ok = passed === shouldPass;
  if (!ok) fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}: guard ${passed ? "allowed" : `blocked (${bad.join(", ")})`}`);
}
process.exit(fail ? 1 : 0);
