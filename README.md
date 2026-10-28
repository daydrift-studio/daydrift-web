# 《度日：Daydrift》官方 Web 矩阵 Monorepo

本仓库（`daydrift-studio/daydrift-web`）是《度日：Daydrift》官方网站、文档中心与共享 UI 组件库的 **pnpm Monorepo** 代码工程，采用纯静态架构构建，通过 Cloudflare Pages 全球 CDN 边缘节点托管。

- 🌐 **官方主站门户**：[daydrift.blym.top](https://daydrift.blym.top)
- 📖 **官方文档中心**：[daydrift-docs.blym.top](https://daydrift-docs.blym.top)
- 🛒 **Mod 扩展商店**：[daydrift-mods.blym.top](https://daydrift-mods.blym.top)
- 🛠️ **模组开发 SDK**：[daydrift-mod-sdk](https://github.com/daydrift-studio/daydrift-mod-sdk)

---

## Monorepo 工程结构

```text
daydrift-web/
├── apps/
│   ├── official/              # 官方网站门户 (Astro 5 + ClientRouter SPA 无缝过渡)
│   │   ├── src/pages/         # 首页、下载矩阵、发行历史、关于、鸣谢、法律条款
│   │   └── public/data/       # release.json / latest.json 静态数据镜像
│   └── docs/                  # 官方文档中心 (Astro Starlight 引擎 + Pagefind 搜索)
│       ├── src/content/docs/  # 玩家指南、三体系 Mod SDK、服务端运维、架构与协议
│       └── public/schemas/    # 在线托管的 JSON Schema 端点 (manifest / slice)
├── packages/
│   ├── ui/                    # 跨应用共享 UI 组件库 (Header, Footer, 像素按钮, Tokens)
│   ├── content/               # 静态清单校验与 Release 解析器
│   └── types/                 # 跨包 TypeScript 类型定义
├── tools/
│   └── sync-dist.mjs          # 编译产物同步合并脚本 (Cloudflare Pages 构建后自动归档)
└── package.json               # Monorepo 根配置与统一构建指令
```

---

## 核心特性与技术亮点

1. **纯静态边缘渲染 (Zero-Runtime Server)**：
   - 全站页面在构建时完全预渲染为纯 HTML/CSS/JS，不依赖任何动态服务器或数据库，首屏毫秒级秒开。
2. **原生跨文档视图过渡 (Cross-Document View Transitions)**：
   - 引入 CSS `@view-transition { navigation: auto; }` 与 Astro 5 `<ClientRouter />`；
   - 子站点与页面之间切换平滑无缝，无白屏闪烁，并附带优雅的像素风顶部加载反馈。
3. **零隐私追踪原则 (Zero-Tracking & Privacy-First)**：
   - 前端绝不植入任何第三方广告 Cookie、用户行为打点或外部遥测 SDK。
4. **共享像素设计系统 (`@daydrift/ui`)**：
   - 统一调色板（复古起居室深蓝黑底、晨光暖琥珀色 `--accent-amber`、沉静苔藓绿 `--accent-moss`）；
   - 内置无障碍焦点环支持与 `prefers-reduced-motion` 动效减免。

---

## 本地开发与指令速查

```bash
# 1. 安装整个 Monorepo 依赖
pnpm install

# 2. 启动官网主站本地热重载开发服务器 (端口 4321)
pnpm dev:official

# 3. 启动文档中心本地热重载开发服务器 (端口 4322)
pnpm dev:docs

# 4. 全局编译构建所有子应用并将产物同步归档至根目录 dist/
pnpm build

# 5. 全工作区 TypeScript 类型检查
pnpm typecheck
```

---

## Cloudflare Pages 持续集成与部署

- **自动化构建**：当代码推送到 `main` 分支时，Cloudflare Pages 自动运行 `pnpm run build`；
- **同步机制**：`apps/docs` 与 `apps/official` 编译完成后，`tools/sync-dist.mjs` 会将两者合并输出至根目录的 `dist/`，统一分发至全球 CDN 边缘节点。
