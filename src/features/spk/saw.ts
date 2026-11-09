/**
 * Simple Additive Weighting (DESIGN §14). Murni, tanpa dependensi, mudah diuji.
 *   benefit: r = x / max(x_j)       cost: r = min(x_j) / x
 *   V_i = Σ w_j · r_ij
 * Penanganan nilai nol (ASUMSI, wajib divalidasi): benefit dengan max = 0 → r = 0;
 * cost dengan x = 0 → r = 1; cost dengan min = 0 dan x > 0 → r = 0.
 */
export interface SawCriterion { code: string; name: string; direction: "benefit" | "cost"; weight: number }
export interface SawAlternative { id: string; values: number[] }
export interface SawResult {
  matrix: number[][]; normalized: number[][]; preference: number[];
  ranking: { id: string; score: number; rank: number }[];
}

export function validateWeights(weights: number[]): { ok: boolean; total: number; message?: string } {
  const total = Math.round(weights.reduce((a, b) => a + b, 0) * 1e6) / 1e6;
  if (weights.some((w) => !Number.isFinite(w) || w < 0)) return { ok: false, total, message: "Bobot tidak boleh negatif atau kosong." };
  if (Math.abs(total - 1) > 1e-6) return { ok: false, total, message: `Total bobot harus 100%, saat ini ${(total * 100).toFixed(2).replace(/\.?0+$/, "")}%.` };
  return { ok: true, total };
}

export function computeSaw(criteria: SawCriterion[], alts: SawAlternative[]): SawResult {
  const matrix = alts.map((a) => a.values);
  const cols = criteria.map((_, j) => matrix.map((row) => row[j] ?? 0));
  const normalized = matrix.map((row) =>
    criteria.map((c, j) => {
      const x = row[j] ?? 0, max = Math.max(...cols[j]), min = Math.min(...cols[j]);
      if (c.direction === "benefit") return max === 0 ? 0 : x / max;
      if (x === 0) return 1;
      return min === 0 ? 0 : min / x;
    }),
  );
  const preference = normalized.map((row) => row.reduce((s, r, j) => s + criteria[j].weight * r, 0));
  const order = preference.map((score, i) => ({ id: alts[i].id, score })).sort((a, b) => b.score - a.score);
  const ranking = order.map((o, i) => ({ ...o, rank: i > 0 && o.score === order[i - 1].score ? 0 : i + 1 }));
  ranking.forEach((r, i) => { if (r.rank === 0) r.rank = ranking[i - 1].rank; }); // skor sama = peringkat sama
  return { matrix, normalized, preference, ranking };
}
