# ADR 0001: 仓库拓扑与双工作区架构决策

- **状态**: Accepted (已通过)
- **日期**: 2026-10-25
- **决策人**: 白鹿原嚒 / Daydrift Studio

---

## 背景与问题

《度日：Daydrift》是一款像素日常生活模拟游戏。随着版本推进至 `0.2.1-alpha`，需要建立包含官方网站、文档中心、Mod 扩展商店以及分发下载的生态体系。

在架构设计中面临以下关键诉求与约束：
1. **游戏本体绝对闭源**：游戏核心源码与素材资产绝不上传至 GitHub（即使私有仓库也不放），避免源码泄露与计费开销；
2. **公开生态与社区交互**：需对外提供官方网站、文档、Mod 商店以及 Mod 创作支持；
3. **分发可信与权威性**：玩家下载需通过权威可信的官方渠道，且具备防篡改校验；
4. **多站点解耦与安全隔离**：Mod 签名密钥、审核流程不得与官网文档混淆。

---

## 决策内容

决定采用 **「本地闭源游戏 + GitHub 公开展现多仓」** 的双工作区拓扑方案：

### 1. 工作区边界划分

- **游戏内核私有工作区（本地 `G:\godot-Project\daydrift`）**：
  - 承载游戏全量源码、美术资源、音频素材及 Godot 工程文件；
  - 纯本地环境，**绝对不建立 GitHub 源码仓库，不执行代码推送**；
  - 本地运行构建（`tools/export_builds.py`）与发布脚本（`tools/publish_release.py`），直推发行资产。

- **公开生态工程总工作区（本地 `G:\Project\daydrift`，对应 GitHub 组织 `daydrift-studio`）**：
  - 下设 4 个独立的公开仓库：
    1. **`daydrift`**（GitHub 公开发行仓）：无游戏源码。仅包含玩家向 README、EULA 与社区 Issues。通过 GitHub Releases 托管全平台客户端、服务端、SHA256SUMS 与 Ed25519 签名清单。
    2. **`daydrift-web`**（官网 + 文档站）：pnpm monorepo (Astro + Starlight)。静态编译部署至 Cloudflare Pages。
    3. **`daydrift-mods`**（Mod 商店与注册表）：包含 Mod 注册表元数据、审核流水线、Ed25519 签名工具及商店站点。
    4. **`daydrift-mod-sdk`**（Mod 开发工具包）：公开 Lua 接口类型声明（`mod_api.d.lua`）、清单 Schema、示例模板与开发指南。

---

## 强制约束与规则

1. **绝对脱敏**：对外公开的任何仓库（Web、Mods、SDK、发行仓）严禁出现游戏私有源码、本地内部绝对路径（如 `G:\godot-Project\...`）或未公开的密钥。
2. **SDK 双向同步**：通过 `tools/sync_mod_sdk.py`，确保游戏工程内部的 Mod API 调整与 `daydrift-mod-sdk` 保持逐字节 SHA-256 一致。
3. **构建解耦**：Cloudflare Pages 仅从公开仓库拉取数据构建，不具有任何私有仓库访问权限。

---

## 后果与权衡

- **正向影响**：
  - 源码绝对安全，物理阻断云端泄露风险；
  - 权威规范，玩家访问 `github.com/daydrift-studio/daydrift` 即可直接获取正版发行包与 EULA；
  - 模块清晰，Web 前端构建与 Mod 审核工具环境互不干扰。
- **负向影响与对策**：
  - 发行构建无法依赖云端 Actions 矩阵，需由本地机器执行编译打包。对策：现有的 `tools/export_builds.py` 已支持一键全矩阵构建，配合发布自动化脚本即可一键发布。
