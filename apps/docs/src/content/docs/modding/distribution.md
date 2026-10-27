---
title: 模组打包、签名与商店发布
description: 如何规范打包 .ddmod 格式、通过安全审计与 Ed25519 签名，并向官方 Mod 商店提交投稿
---

当你的模组开发与本地测试完成后，你可以将其打包为标准 `.ddmod` 格式，并向官方 Mod 商店提交上架申请，与全球旅人共享你的创意。

---

## 1. 规范打包流程

在提交前，请使用官方 CLI 工具链执行最终的合规审计与打包：

```bash
# 1. 运行严格静态安全审计
python sdk/ddmod_cli.py validate path/to/my_mod

# 2. 生成标准分发包
python sdk/ddmod_cli.py pack path/to/my_mod --out-dir ./dist
```

打包完成后，控制台将输出生成的 `.ddmod` 文件绝对路径以及对应的 **SHA-256 哈希值**。请妥善记录该哈希值，后续提交 PR 时需要填写。

---

## 2. 官方 Mod 商店提交流程

官方 Mod 商店采用去中心化的 GitOps 工作流，通过向 GitHub 仓库 [daydrift-studio/daydrift-mods](https://github.com/daydrift-studio/daydrift-mods) 提交 Pull Request 完成收录与发布。

### 步骤概览：
1. **Fork 仓库**：在 GitHub 上 Fork `daydrift-studio/daydrift-mods` 至个人账户；
2. **创建模组目录**：在 `mods/` 目录下以你的模组 `id` 创建子文件夹（如 `mods/rainy_coffee_corner/`）；
3. **放置必要文件**：
   - `manifest.json`：符合 Schema 规范的清单文件；
   - `preview.webp`：高分辨率封面展示图（建议 1280x720，无损 WebP 格式）；
   - `README.md`：详细的使用说明、作者介绍、开源协议与截图展示；
   - `.ddmod` 分发包或 release 下载外链配置。
4. **发起 Pull Request**：
   - PR 标题：`feat(mod): submit <mod_id> v<version>`；
   - PR 正文中填写模组功能简述与计算出的 SHA-256 校验和。

---

## 3. 安全审计与 Ed25519 数字签名

为了保护玩家免受木马、供应链投毒或恶意代码侵扰，所有进入官方商店的模组均需通过自动化 CI 审计与核心维护者的数字签名：

- **自动化 CI 审计**：
  - 校验 `manifest.json` 与 JSON Schema 的契约一致性；
  - 检查版本号是否冲突；
  - 校验包内所有文件的 SHA-256 完整性摘要；
  - 检查代码是否存在禁用 API（如针对 Tier 2 脚本检查是否越界访问未授权环境）。
- **Ed25519 官方认证签名**：
  - 通过人工审查与 CI 校验后，维护者使用官方私钥为模组签发 `daydrift.sig.json`；
  - 游戏客户端加载模组时会校验该签名：
    - 拥有官方有效签名的模组，管理面板展示 **「官方认证 (Verified)」** 徽标；
    - 未签名或自签名的本地模组，展示 **「社区未认证 (Community)」** 提示。

---

## 4. 模组更新与语义化版本维护

- 当修复 Bug 或追加新内容时，必须递增 `manifest.json` 中的 `version` 字段（遵循 SemVer 规范，例如 `1.0.0` -> `1.0.1`）；
- 若涉及破坏性变更（如修改了存储在存档中的数据结构），请在 `description` 或更新日志中明确提示，避免损坏玩家的历史存档。
