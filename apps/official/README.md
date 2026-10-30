# 《度日：Daydrift》官方主站 (@daydrift/official)

> 线上访问地址：[daydrift.blym.top](https://daydrift.blym.top)

本子项目为《度日：Daydrift》的官方门户网站，基于 Astro 5 构建，提供游戏核心概念展示、全平台客户端与无头服务端下载、发布版本（Releases）历史历程、关于与致谢声明，以及 EULA 与隐私合规法律协议。

---

## 页面架构与路由映射

| 路由路径 | 对应源文件 | 核心职责 |
| :--- | :--- | :--- |
| `/` | `src/pages/index.astro` | 官方主页：核心视觉宣传、四时流转理念、即刻启程入口 |
| `/download` | `src/pages/download.astro` | 全平台矩阵下载页：Windows、Linux (SteamOS)、macOS、Android 客户端及无头独立服务端 |
| `/releases` | `src/pages/releases.astro` | 发行版本演进日志：版本列表、SHA-256 校验和、Ed25519 签名状态与更新说明 |
| `/about` | `src/pages/about.astro` | 关于度日：创作理念、制作团队、技术选型（Godot 4.7 & Go） |
| `/credits` | `src/pages/credits.astro` | 致谢与开源许可声明：音乐、字体、素材与第三方技术栈出处 |
| `/legal/eula` | `src/pages/legal/eula.astro` | 最终用户许可协议 (EULA) 与创作者权利声明 |
| `/legal/privacy` | `src/pages/legal/privacy.astro` | 隐私政策与本地持久化数据免除收集声明 |
| `/404` | `src/pages/404.astro` | 像素风优雅 404 页面 |

---

## 技术特性

1. **共享设计系统**：
   - 依赖本地工作区共享组件库 `@daydrift/ui`，采用统一的 Ark Pixel 像素字体体系与调色板 Token（`tokens.css`）；
   - 使用统一跨站顶栏 `Header.astro` 与页脚 `Footer.astro`，支持直达模组工坊与文档中心。
2. **零运行时开销 (Zero JS by default)**：
   - 基于 Astro 5 静态站点生成（SSG），极致轻量且首屏加载毫秒级响应；
   - 启用 Astro View Transitions（视图过渡），实现子页面之间无刷新丝滑过渡。
3. **真实发布数据同步**：
   - 下载矩阵由 `src/lib/releaseData.ts` 强类型定义驱动，与官方 Release 发布资产哈希（`SHA256SUMS`）精确对应。

---

## 本地开发与构建指南

在仓库根目录 `G:\Project\daydrift\daydrift-web` 下执行：

```bash
# 安装依赖
pnpm install

# 启动本地开发热重载服务器 (端口 4321)
pnpm run dev:official

# 执行 TypeScript 与 Astro 严格类型检查
pnpm --filter @daydrift/official run typecheck

# 生产环境打包构建
pnpm --filter @daydrift/official run build
```
构建产物将输出至 `dist/official/` 目录，可直接托管于 Cloudflare Pages 或任何静态托管平台。
