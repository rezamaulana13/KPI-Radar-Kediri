import type { AstroCookies } from "astro";
/** Mengembalikan isian & error form sekali pakai setelah redirect (cookie httpOnly 60 detik). */
export function takeFormState(cookies: AstroCookies, url: URL) {
  if (url.searchParams.get("retry") !== "1") return { error: undefined as string | undefined, fields: {} as Record<string, string>, values: {} as Record<string, any> };
  const c = cookies.get("rk_form")?.value; cookies.delete("rk_form", { path: "/" });
  try { return c ? (JSON.parse(c) as { error?: string; fields: Record<string, string>; values: Record<string, any> }) : { error: undefined, fields: {}, values: {} }; }
  catch { return { error: undefined, fields: {}, values: {} }; }
}
