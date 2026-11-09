export interface TableOptions { searchKeys?: string[]; filterKeys?: string[]; perPage?: number }
/** Filter (kecocokan persis), pencarian teks, lalu pagination — semuanya dari query string. */
export function applyTable<R extends Record<string, any>>(rows: R[], url: URL, o: TableOptions = {}) {
  const sp = url.searchParams;
  let out = rows;
  for (const k of o.filterKeys ?? []) { const v = sp.get(k); if (v) out = out.filter((r) => String(r[k]) === v); }
  const q = sp.get("q")?.trim().toLowerCase();
  if (q && o.searchKeys?.length) out = out.filter((r) => o.searchKeys!.some((k) => String(r[k] ?? "").toLowerCase().includes(q)));
  const perPage = o.perPage ?? 10;
  const pages = Math.max(1, Math.ceil(out.length / perPage));
  const page = Math.min(Math.max(1, Number(sp.get("page")) || 1), pages);
  return { rows: out.slice((page - 1) * perPage, page * perPage), total: out.length, page, perPage };
}
