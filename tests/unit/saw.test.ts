import { test } from "node:test";
import assert from "node:assert/strict";
import { computeSaw, validateWeights } from "../../src/features/spk/saw.ts";

const criteria = [
  { code: "C1", name: "Deal", direction: "benefit" as const, weight: 0.6 },
  { code: "C2", name: "Biaya", direction: "cost" as const, weight: 0.4 },
];

test("SAW: benefit dibagi max, cost min dibagi nilai", () => {
  const r = computeSaw(criteria, [{ id: "A", values: [4, 2] }, { id: "B", values: [2, 1] }]);
  assert.deepEqual(r.normalized, [[1, 0.5], [0.5, 1]]);
  assert.equal(r.preference[0], 0.6 * 1 + 0.4 * 0.5);
  assert.equal(r.ranking[0].id, "A");
});

test("SAW: nilai nol ditangani tanpa NaN/Infinity", () => {
  const r = computeSaw(criteria, [{ id: "A", values: [0, 0] }, { id: "B", values: [0, 3] }]);
  r.normalized.flat().forEach((v) => assert.ok(Number.isFinite(v)));
});

test("Bobot harus berjumlah 100%", () => {
  assert.equal(validateWeights([0.5, 0.5]).ok, true);
  assert.equal(validateWeights([0.5, 0.4]).ok, false);
  assert.equal(validateWeights([1.2, -0.2]).ok, false);
});
