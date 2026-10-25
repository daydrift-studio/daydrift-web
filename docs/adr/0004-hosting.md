# ADR 0004: Cloudflare Pages 静态托管与全静态架构

- **状态**: Accepted (已通过)
- **日期**: 2026-10-25
- **决策人**: 白鹿原嚒 / Daydrift Studio

---

## 背景与问题

三站点（官网、文档、Mod 商店）预期具有高并发、全球化访问以及低维护成本的特点。
如果采用传统的云服务器（Node.js / Python / 数据库），不仅需要承担运维与安全防护成本，还存在服务宕机与 API 凭据泄露的隐患。

---

## 决策内容

### 1. 全静态托管技术选型

决定采用 **Cloudflare Pages + 纯静态生成 (SSG)**：

- **官方网站**：基于 **Astro** 静态输出，构建极简沉浸的像素风格宣传与下载页面；
- **文档中心**：基于 **Starlight**（Astro 生态文档框架），天然支持搜索、多语言与深色主题；
- **Mod 商店**：纯静态输出，搜索与分类索引在构建期生成，客户端使用静态轻量原生 JS 过滤，不引入庞大前端运行时；
- **零后端与零运行时依赖**：无 SSR、无云端数据库、无在线鉴权服务器，将攻击面降至最低。

### 2. 独立 Pages 项目划分

在 Cloudflare Pages 中建立 3 个独立项目：

1. **`daydrift-official`**：对应源码仓库 `daydrift-web`，根目录设置为 `apps/official`；
2. **`daydrift-docs`**：对应源码仓库 `daydrift-web`，根目录设置为 `apps/docs`；
3. **`daydrift-mods`**：对应源码仓库 `daydrift-mods`，根目录设置为 `site`（或 `apps/store`）。

配置严格的路径监听（Watch Paths），修改文档不触发官网构建，修改官网不触发商店重构。

### 3. 数据快照契约（杜绝浏览器调用 GitHub API）

- 静态构建时，CI 从公开仓库拉取 Release 与 Mod 元数据，固化为 `data/releases.json`、`data/latest.json` 与 `data/catalog.json` 并随站点打包；
- **浏览器运行时严禁直接调用 GitHub REST API**，彻底杜绝未登录用户遭遇 60 次/小时限流的问题，保障站点在任何网络环境下稳定秒开。

### 4. 安全响应头与 CSP 规范 (`public/_headers`)

所有站点均在构建目录注入 `_headers` 配置文件：
- **CSP (Content-Security-Policy)**：严格禁止 `unsafe-inline` 动态执行，除白名单 CDN 外严禁外链脚本；
- **HSTS**：强制 `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`；
- **防嗅探与防点击劫持**：`X-Content-Type-Options: nosniff`，`X-Frame-Options: DENY`；
- **CORS 策略**：Mod 商店的 `/catalog.json` 开放 `Access-Control-Allow-Origin: *`，允许第三方合法启动器读取。

### 5. 秒级原子回滚 (Instant Rollback)

若某次部署发现严重排版错误或异常：
- Cloudflare Pages 保留每次部署的历史快照，在控制台点击任意历史部署即可实现**零等待、零停机时间的一键原子回滚**，无需等待重新编译。
