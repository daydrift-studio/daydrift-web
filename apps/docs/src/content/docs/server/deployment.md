---
title: 独立服务端部署指南
description: 如何运行与配置《度日：Daydrift》跨平台独立服务端
---

官方发布的 `Daydrift_Server_v{version}_{platform}.zip` 提供了无头模式（Headless）独立服务端，免 GPU 渲染，开箱即用。

## 启动说明

1. 从官方 [Releases](https://github.com/daydrift-studio/daydrift/releases) 下载对应平台的 Server 压缩包；
2. 解压至服务器目录：
   ```bash
   unzip Daydrift_Server_v0.2.1-alpha_linux_x64.zip -d daydrift-server
   cd daydrift-server
   ```
3. 启动服务端：
   ```bash
   chmod +x daydrift_server
   ./daydrift_server --port 7777 --max-players 8
   ```

## 核心配置项 (`config.toml`)

解压包内默认附带 `config.toml`：
- `port`: 监听端口（默认 `7777`）；
- `max_players`: 最大同时漫游旅人数量；
- `room_name`: 房间对外展示名称；
- `password`: 可选入房密码；
- `time_flow_enabled`: 是否允许服务器自动推进时间流转。
