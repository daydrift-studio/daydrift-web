---
title: 服务端配置项全景参考 (config.toml)
description: 《度日：Daydrift》独立服务端 config.toml 完整配置参数、类型与性能调优指南
---

服务端解压后默认包含 `config.toml` 配置文件。本文档详细列出了所有支持的配置段落、字段定义、默认值与推荐优化策略。

---

## 1. 完整示例文件 (`config.toml`)

```toml
[server]
# 服务监听端口 (TCP)
port = 7777

# 房间最大同时在线旅人数量 (建议 4 ~ 32)
max_players = 16

# 房间对外广播展示的名称
room_name = "午后两点的小憩"

# 入房密码 (留空表示公开房间，无密码保护)
password = ""

# 网络更新频率 (Tick Rate，单位：次/秒，推荐 20 或 30)
tick_rate = 20

# 日志输出等级 ("debug" | "info" | "warn" | "error")
log_level = "info"

# 启用局域网多播/UDP广播发现 (云主机部署若不需要内网发现可设为 false)
enable_lan_broadcast = true


[world]
# 是否开启四时世界时钟自动流转
time_flow_enabled = true

# 每个离散时段（清晨/正午/傍晚/深夜）的持续时长（单位：秒，默认 300 秒即 5 分钟）
period_duration_seconds = 300

# 初始起始天数
initial_day = 1

# 初始起始时段 (0: 清晨, 1: 正午, 2: 傍晚, 3: 深夜)
initial_period = 0

# 睡眠跨天共识策略 ("all_players" | "majority" | "host_only")
sleep_consensus_mode = "majority"


[mods]
# 服务端加载模组的目录路径 (相对路径或绝对路径)
mods_dir = "mods"

# 是否强制要求客户端必须安装服务端所加载的所有双端模组
require_exact_mods = false

# 允许服务端执行的最高模组体系等级 (1: 仅数据, 2: 允许 Lua 脚本)
allowed_max_tier = 2


[security]
# 单客户端发包速率限制 (每秒最大允许包数量，防止恶意网络泛洪)
rate_limit_packets_per_sec = 60

# 单个数据包最大有效载荷大小 (单位：字节，默认 65536 即 64KB)
max_payload_bytes = 65536

# 客户端心跳超时自动踢出时间 (单位：秒)
heartbeat_timeout_seconds = 15
```

---

## 2. 配置字段详细说明

### 2.1 `[server]` 核心网络段

- **`port`** (`integer`, 默认 `7777`)
  指定服务端监听的 TCP 端口。如果同一台服务器上多开房间，必须分别为每个实例指定不同的端口号。
- **`max_players`** (`integer`, 默认 `16`)
  最大同时在线人数。超出该数量后，新加入的客户端将收到连接已满的错误响应。
- **`room_name`** (`string`, 默认 `"午后两点的小憩"`)
  房间对外名称。支持 UTF-8 编码的中英文字符串。
- **`password`** (`string`, 默认 `""`)
  房间访问密码。如果填写非空字符串，客户端握手时必须提供匹配的哈希凭据，否则将被拒绝入内。
- **`tick_rate`** (`integer`, 默认 `20`)
  每秒逻辑帧循环与状态广播次数。20 tick 既能保障丝滑流畅的角色漫步体验，又能保持微小的 CPU 与网络带宽开销。

### 2.2 `[world]` 四时世界段

- **`time_flow_enabled`** (`boolean`, 默认 `true`)
  是否开启四时流转。若设为 `false`，小镇将永远定格在特定时段（如永远定格在宁静的傍晚），适合用于特定的长久打卡房间。
- **`period_duration_seconds`** (`integer`, 默认 `300`)
  每个时段的标准现实时间。如果设置为 `300`，则现实中经历 20 分钟对应小镇内完整的一天四时轮回。
- **`sleep_consensus_mode`** (`string`, 默认 `"majority"`)
  多名旅人就寝时的结算规则：
  - `"all_players"`：必须房间内所有在线玩家均与床榻交互才跨天；
  - `"majority"`：超过半数玩家就寝即触发跨天倒计时；
  - `"host_only"`：仅根据房主意愿结算。

### 2.3 `[mods]` 模组策略段

- **`mods_dir`** (`string`, 默认 `"mods"`)
  服务端扫描与加载模组的目录；
- **`require_exact_mods`** (`boolean`, 默认 `false`)
  严格模组一致性锁。开启后，客户端若未安装服务端清单中的同版本模组，将被拒绝加入，保障联机玩法体验的绝对一致。

### 2.4 `[security]` 安全防御段

- **`rate_limit_packets_per_sec`** (`integer`, 默认 `60`)
  单连接发包速率限制阈值，自动拦截恶意抓包重放或异常发包脚本；
- **`heartbeat_timeout_seconds`** (`integer`, 默认 `15`)
  客户端掉线或异常无响应超过该时间后，服务端将自动释放其资源并广播离开事件。
