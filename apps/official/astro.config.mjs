import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://daydrift.example",
  output: "static",
  build: {
    format: "directory"
  },
  redirects: {
    "/eula": "/legal/eula",
    "/privacy": "/legal/privacy",
    "/changelog": "/releases"
  }
});
