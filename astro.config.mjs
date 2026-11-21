import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";

// Adapter Vercel Serverless untuk deployment ke Vercel
export default defineConfig({
  output: "server",
  adapter: vercel(),
  security: { checkOrigin: true },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "hover",
  },
});
