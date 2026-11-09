/// <reference types="astro/client" />
import type { Role } from "./lib/data/types";

declare global {
  namespace App {
    interface Locals {
      user: { id: string; name: string; email: string; role: Role; divisionId: string; mode: "demo" | "supabase" } | null;
    }
  }
}
interface ImportMetaEnv {
  readonly PUBLIC_SUPABASE_URL?: string;
  readonly PUBLIC_SUPABASE_ANON_KEY?: string;
  readonly SUPABASE_SERVICE_ROLE_KEY?: string;
}
interface ImportMeta { readonly env: ImportMetaEnv }
