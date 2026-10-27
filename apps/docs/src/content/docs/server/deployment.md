---
title: 独立服务端部署指南
description: 如何在 Linux、Windows 及 Docker 环境中运行与托管《度日：Daydrift》无头独立服务端
---

官方发布的 `Daydrift_Server_v{version}_{platform}.zip` 提供了基于 Go 语言构建的纯无头（Headless）独立服务端。免除一切图形渲染驱动，具备内存占用极低（< 50MB）、高并发吞吐与开箱即用的特性。

---

## 1. 系统要求与环境准备

- **操作系统**：
  - Linux (Ubuntu 20.04+, Debian 11+, CentOS 8+, Alpine 3.16+)
  - Windows Server 2016+ / Windows 10/11 64-bit
  - macOS (Apple Silicon & Intel)
- **网络条件**：拥有公网静态 IP 或可通过 NAT 端口映射/内网穿透访问，开放监听端口（默认 `7777` TCP）；
- **硬件配置**：单核 CPU，512MB RAM 即可流畅支撑 16+ 旅人同时在线。

---

## 2. Linux 环境常规部署

### 2.1 解压与运行
```bash
# 1. 下载并解压服务端归档
unzip Daydrift_Server_v0.2.1-alpha_linux_x64.zip -d daydrift-server
cd daydrift-server

# 2. 赋予执行权限
chmod +x daydrift_server

# 3. 前台测试启动
./daydrift_server --config config.toml
```

### 2.2 配置 Systemd 后台系统服务

为了确保服务器在意外崩溃或主机重启后能够自动复活，建议配置 systemd 托管服务：

创建配置文件 `/etc/systemd/system/daydrift.service`：

```ini
[Unit]
Description=Daydrift Dedicated Server
After=network.target

[Service]
Type=simple
User=daydrift
WorkingDirectory=/opt/daydrift-server
ExecStart=/opt/daydrift-server/daydrift_server --config /opt/daydrift-server/config.toml
Restart=on-failure
RestartSec=5s
LimitNOFILE=65536

# 日志输出重定向
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

激活并启动系统服务：
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now daydrift
sudo systemctl status daydrift
```

查看实时运行日志：
```bash
journalctl -u daydrift -f
```

---

## 3. Docker 容器化部署

如果你偏好容器化运维，可以使用以下配置快速拉起服务：

### 3.1 编写 `Dockerfile`

```dockerfile
FROM alpine:3.19
WORKDIR /app
COPY daydrift_server .
COPY config.toml .
RUN chmod +x daydrift_server
EXPOSE 7777
ENTRYPOINT ["./daydrift_server", "--config", "config.toml"]
```

### 3.2 编写 `docker-compose.yml`

```yaml
version: "3.8"

services:
  daydrift-server:
    build: .
    container_name: daydrift_server
    restart: always
    ports:
      - "7777:7777"
    volumes:
      - ./config.toml:/app/config.toml
      - ./mods:/app/mods
      - ./data:/app/data
    environment:
      - TZ=Asia/Shanghai
```

执行启动：
```bash
docker compose up -d
```

---

## 4. 防火墙与网络端口放行

为了确保外部玩家能够成功连接，必须在云服务器安全组与操作系统防火墙中放行对应端口：

### UFW 防火墙 (Ubuntu / Debian)
```bash
sudo ufw allow 7777/tcp comment "Daydrift Game Port"
sudo ufw reload
```

### Firewalld 防火墙 (CentOS / RHEL)
```bash
sudo firewall-cmd --zone=public --add-port=7777/tcp --permanent
sudo firewall-cmd --reload
```

> **注意**：如果云服务器位于阿里云、腾讯云、AWS 或 GCP 等平台上，请务必前往云控制台的 **「安全组规则 (Security Groups)」** 中添加入方向允许规则：协议 `TCP`，端口 `7777`，源地址 `0.0.0.0/0`。
