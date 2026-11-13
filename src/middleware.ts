import { defineMiddleware } from "astro:middleware";
import { getCurrentUser } from "./lib/auth/get-current-user";
import { canAccessPath } from "./lib/permissions/can";
import { PUBLIC_PATHS } from "./lib/permissions/roles";
import { hydrateFromSupabase } from "./lib/supabase/sync";

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const isApi = pathname.startsWith("/api/");
  if (pathname.startsWith("/_astro") || pathname.startsWith("/images")) return next();

  await hydrateFromSupabase();
  context.locals.user = await getCurrentUser(context);
  if (PUBLIC_PATHS.includes(pathname) || pathname === "/") return next();

  if (!context.locals.user) {
    if (isApi) return Response.json({ error: "Sesi berakhir. Silakan masuk kembali." }, { status: 401 });
    return context.redirect(`/login?next=${encodeURIComponent(pathname + context.url.search)}`);
  }
  if (!canAccessPath(context.locals.user.role, pathname)) {
    if (isApi) return Response.json({ error: "Anda tidak memiliki akses untuk aksi ini." }, { status: 403 });
    return context.rewrite("/403");
  }
  return next();
});
