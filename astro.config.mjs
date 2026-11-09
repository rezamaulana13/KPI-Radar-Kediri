import { defineConfig } from "astro/config";
import node from "@astrojs/node";

// Adapter Node standalone. Ganti sesuai hosting yang disetujui perusahaan.
export default defineConfig({
  output: "server",
  adapter: node({ mode: "standalone" }),
  security: { checkOrigin: true },
});
