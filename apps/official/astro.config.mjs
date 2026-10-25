import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://daydrift.blym.top",
  output: "static",
  build: {
    format: "directory"
  },
  redirects: {
    "/eula": "/legal/eula",
    "/privacy": "/legal/privacy",
    "/changelog": "/releases",
    "/history": "/releases"
  }
});
