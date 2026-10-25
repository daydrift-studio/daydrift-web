import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://daydrift.example",
  output: "static",
  build: {
    format: "directory"
  }
});
