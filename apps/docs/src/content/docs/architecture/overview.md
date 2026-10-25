---
title: 架构与安全规范
description: 《度日：Daydrift》多仓分发、签名审计与静态托管架构
---

本文档归纳了《度日：Daydrift》生态的技术拓扑与安全防御策略。

## 核心架构原则

1. **游戏内核绝对闭源**：游戏源代码不推送到任何公共或私有云端 Git 仓库，由维护者在本地环境编译与签名；
2. **公开生态与分发解耦**：GitHub 上的 `daydrift-studio/daydrift` 仅承担发行说明与 Release 附件分发，不含源代码；
3. **数字签名与供应链安全**：
   - Release 安装包附带 `release.json.sig` 与 `latest.json.sig`（Ed25519 签名）；
   - Mod 模组附带 `daydrift.sig.json`，覆盖全部文件的 SHA-256 摘要；
   - 篡改任何一个字节或签名不匹配将直接导致构建或校验拦截，严禁未签名伪充官方；
4. **全静态边缘托管**：官网站与文档站均通过 Astro / Starlight 输出静态页面部署至 Cloudflare Pages，前端运行时绝不直连第三方 API。
