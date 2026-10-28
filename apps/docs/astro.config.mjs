import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

export default defineConfig({
  site: "https://daydrift-docs.blym.top",
  output: "static",
  integrations: [
    starlight({
      title: "《度日：Daydrift》文档中心",
      logo: {
        src: "./src/assets/icon.svg",
        replacesTitle: false,
      },
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
          items: [
            { label: "快速上手与键位", link: "/player/getting-started/" },
            { label: "局域网与同游漫步", link: "/player/multiplayer/" },
            { label: "模组安装与自愈排查", link: "/player/mod-installation/" },
            { label: "玩家高频问题全解 (FAQ)", link: "/player/faq/" }
          ]
        },
        {
          label: "三体系 Mod SDK",
          items: [
            { label: "体系概览与选型矩阵", link: "/modding/overview/" },
            { label: "CLI 工具链与工程配置", link: "/modding/cli-toolchain/" },
            {
              label: "分级实战指南",
              items: [
                { label: "Tier 1: 纯数据切片开发", link: "/modding/tier1-data/" },
                { label: "Tier 2: 双端脚本沙盒开发", link: "/modding/tier2-script/" },
                { label: "Tier 3: 原生 PCK 全权基类", link: "/modding/tier3-native/" },
                { label: "三场景交互与世界构建", link: "/modding/scene-interaction-guide/" }
              ]
            },
            { label: "全量 API 字典速查", link: "/modding/api/" },
            { label: "开发报错与自愈排查", link: "/modding/troubleshooting/" },
            { label: "模组打包、签名与发布", link: "/modding/distribution/" }
          ]
        },
        {
          label: "服务端运维",
          items: [
            { label: "无头服务端部署指南", link: "/server/deployment/" },
            { label: "配置项全景参考 (config.toml)", link: "/server/configuration/" },
            { label: "模组同步与网络协议", link: "/server/mod-sync/" }
          ]
        },
        {
          label: "架构与生态",
          items: [
            { label: "架构全景与供应链安全", link: "/architecture/overview/" },
            { label: "底层通信协议与帧结构", link: "/architecture/network-protocol/" }
          ]
        }
      ],
      customCss: [
        "@daydrift/ui/styles"
      ]
    })
  ]
});
