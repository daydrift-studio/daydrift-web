# 《度日：Daydrift》官方文档中心 (@daydrift/docs)

> 线上访问地址：[daydrift-docs.blym.top](https://daydrift-docs.blym.top)

本子项目为《度日：Daydrift》的官方开发者与玩家文档中心，基于 Astro Starlight 构建，为创作者与玩家提供一站式、可检索、结构严密的权威技术文档与游玩指南。

---

## 内容板块分类

文档内容位于 `src/content/docs/` 目录，分为四大板块：

### 1. 玩家指南 (`player/`)
- `getting-started.md`：游戏基础操作、界面元素、按键说明与存档逻辑。
- `multiplayer.md`：局域网联机与独立无头服务端加入教程。
- `mod-installation.md`：免解压导入、一键深链接安装与模组管理。
- `faq.md`：常见问题汇总、安全模式降级自愈与排障流程。

### 2. 模组创作全书 (`modding/`)
- `overview.md`：三体系分流架构（Tier 1 数据切片、Tier 2 Lua 脚本沙盒、Tier 3 原生 PCK）总览与选型矩阵。
- `tier1-data.md`：纯数据包开发指南（物品、日常切片、对话台词、多语言注册）。
- `tier2-script.md`：轻量逻辑沙盒开发指南（Lua 脚本、事件捕获、双端报文收发）。
- `tier3-native.md`：原生引擎全权扩展开发指南（`DaydriftNativeMod` 基类、零残留热回滚、场景挂载与物理木门注入）。
- `api.md`：全量模组 API 参考规范（客户端与服务端 API 列表）。
- `cli-toolchain.md`：官方命令行脚手架 `ddmod_cli.py` / `ddmod` 使用指南。
- `distribution.md`：模组打包、确定性 ZIP 规范与 Ed25519 签名提审流程。
- `scene-interaction-guide.md`：场景交互物件、四时出没与 NPC 作息覆盖。
- `troubleshooting.md`：常见报错速查与调试技巧。

### 3. 服务端运维 (`server/`)
- `deployment.md`：轻量级独立服务端（Linux/Windows/macOS）安装部署与 Systemd 守护进程配置。
- `configuration.md`：`server.cfg` 参数详解（端口、tick rate、最大人数、黑名单）。
- `mod-sync.md`：服务端与客户端模组协同校验、同心圆校验模型（Symmetric Mod Verification）。

### 4. 系统底层架构 (`architecture/`)
- `overview.md`：Godot 4.7 引擎架构与设计原则。
- `network-protocol.md`：基于 ENet 的自定义紧凑二进制报文协议规范与 OpCode 表。

---

## 本地开发与维护

在仓库根目录 `G:\Project\daydrift\daydrift-web` 下执行：

```bash
# 启动文档本地开发服务 (端口 4322)
pnpm run dev:docs

# 执行 API 规范一致性校验
pnpm --filter @daydrift/docs run check:api

# 执行 Astro 与 Markdown 内容类型检查
pnpm --filter @daydrift/docs run typecheck

# 构建生产产物
pnpm --filter @daydrift/docs run build
```
产物将输出至 `dist/docs/` 目录。
