import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

export default defineConfig({
  site: "https://docs.daydrift.example",
  output: "static",
  integrations: [
    starlight({
      title: "《度日：Daydrift》文档中心",
      defaultLocale: "root",
      locales: {
        root: {
          label: "简体中文",
          lang: "zh-CN"
        }
      },
      social: {
        github: "https://github.com/daydrift-studio/daydrift"
      },
      sidebar: [
        {
          label: "玩家指南",
          autogenerate: { directory: "player" }
        },
        {
          label: "模组创作",
          autogenerate: { directory: "modding" }
        },
        {
          label: "服务端运维",
          autogenerate: { directory: "server" }
        },
        {
          label: "架构与规范",
          autogenerate: { directory: "architecture" }
        }
      ],
      customCss: [
        "@daydrift/ui/styles"
      ]
    })
  ]
});
