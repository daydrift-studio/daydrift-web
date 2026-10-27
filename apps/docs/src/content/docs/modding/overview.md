---
title: 三体系 Mod 架构概览与选型矩阵
description: 《度日：Daydrift》三分流模组体系架构、能力边界、安全模型与 Manifest 清单规范
---

《度日：Daydrift》采用面向未来的**三体系模组架构（3-Tier Modding Architecture）**。从零代码的轻量文案配置，到具备完整底层引擎支配力的原生 GDScript/PCK 扩展，系统为不同背景的创作者提供了量体裁衣的技术路径。

---

## 1. 三体系模组选型矩阵

创作者可根据自己的开发诉求、技术栈储备与权限需求，自由选择对应等级：

| 特性维度 | Tier 1：纯数据扩展 (Data Pack) | Tier 2：轻量逻辑沙盒 (Script Pack) | Tier 3：原生全权扩展 (Native PCK) |
| :--- | :--- | :--- | :--- |
| **受众群体** | 剧本策划、文案作者、音乐美术同人 | 数值与机制设计者、轻度玩法程序员 | 独立游戏开发者、深度魔改工程师 |
| **编程门槛** | **完全零代码**（编写 JSON / CSV） | 基础 Lua 脚本开发能力 | Godot 4 / GDScript 原生引擎开发经验 |
| **核心格式** | JSON 切片 + CSV 翻译 + 媒体素材 | `.lua` 双端脚本 + 清单配置 | `.pck` 编译资源包 + `entry.gd` |
| **执行载体** | 引擎内置的数据合并驱动器 | 纯解释型 Lua 沙盒虚拟机 (双端) | Godot 原生引擎挂载与场景树直接执行 |
| **引擎控制力** | 受限于数据注册表规范 | 受限于白名单 `ModAPI` / `ServerAPI` | **100% 原生代码等价 (Full Native Equivalence)** |
| **网络同步** | 客户端本地生效 | 双端联动、支持自定义 OpCode 报文通信 | 直接操作底层网络流与自定义数据包 |
| **安全机制** | 物理级零攻击面，无法执行可执行代码 | 虚拟指令配额、内存限制与异常隔离 | 启动崩溃自愈锁（`booting.lock`）兜底 |
| **热重载支持** | 支持即时重载 | 支持沙盒上下文重置 | 支持干净回滚 (`Zero-Residue Rollback`) |
| **典型应用** | 追加日常对话、事件切片、新物品、替换BGM | 动态天气事件、交互连锁判定、疲劳状态效果 | 自定义物理房间门、魔改UI界面、全屏着色器 |

---

## 2. 核心生态仓库与工具链

《度日》模组生态由四个核心开源项目相互协同构成：

1. **官方 Mod SDK** ([daydrift-studio/daydrift-mod-sdk](https://github.com/daydrift-studio/daydrift-mod-sdk))：
   - 包含 `ddmod_cli.py` 跨平台命令行工具；
   - 包含 JSON Schema 规范定义与类型补全存根（`client_mod_api.d.lua`, `server_mod_api.d.lua`, `daydrift_native_mod.gd`）；
   - 包含 Tier 1、Tier 2、Tier 3 与完整案例（如雨天手冲咖啡馆）项目工程模板。
2. **官方 Mod 商店与注册表** ([daydrift-studio/daydrift-mods](https://github.com/daydrift-studio/daydrift-mods))：
   - 面向玩家的模组浏览与一键获取平台；
   - 托管社区投稿的索引、SHA-256 校验和与 Ed25519 签名。
3. **官方文档中心** ([daydrift-docs.blym.top](https://daydrift-docs.blym.top))：
   - 托管本文档及全套 API 字典与在线 JSON Schema 校验端点。
4. **发行主仓** ([daydrift-studio/daydrift](https://github.com/daydrift-studio/daydrift))：
   - 托管各平台独立安装包与无头服务端发行二进制。

---

## 3. 标准元数据清单 `manifest.json` 规范 (v2)

任何类型的模组根目录下都必须包含一个严格符合 JSON Schema 规范的 `manifest.json` 清单文件。

```json
{
  "$schema": "https://daydrift-docs.blym.top/schemas/manifest.schema.json",
  "id": "rainy_coffee_corner",
  "name": "雨天手冲咖啡馆",
  "version": "1.0.0",
  "author": "悠然旅人",
  "description": "在街道转角增设一处雨天营业的手冲咖啡摊位，附带全新蒸汽音效与剧情分支。",
  "tier": 2,
  "type": "script",
  "entry": "scripts/main.lua",
  "priority": 100,
  "net_sync_mode": "dual_sided",
  "dependencies": {},
  "permissions": [
    "network_mod_packet",
    "modify_blackboard"
  ]
}
```

### 字段说明

| 属性字段 | 数据类型 | 必须 | 规范说明 |
| :--- | :--- | :--- | :--- |
| `$schema` | `string` | 推荐 | 指定 JSON Schema 校验端点，在 VSCode 中提供实时校验与错误高亮 |
| `id` | `string` | **是** | 模组唯一标识符。必须全小写字母、数字或下划线，长度 1-64 字符 |
| `name` | `string` | **是** | 模组对外显示的名称 |
| `version` | `string` | **是** | 必须遵循语义化版本号标准（SemVer），如 `1.0.0` 或 `0.2.1-beta` |
| `author` | `string` | **是** | 创作者或团队名称 |
| `description` | `string` | **是** | 模组功能概述简述 |
| `tier` | `integer` | **是** | 体系分级：`1` (纯数据), `2` (轻量脚本), `3` (原生 PCK) |
| `type` | `string` | **是** | 体系别名：`"data"` \| `"script"` \| `"native"` |
| `entry` | `string` | 条件 | 启动入口文件相对路径。Tier 1 可留空；Tier 2 默认为 `scripts/main.lua`；Tier 3 必须指定 GDScript 入口（如 `entry.gd`） |
| `priority` | `integer` | 否 | 加载优先级（默认 `100`）。数值越大越优先被加载并抢占资源 |
| `net_sync_mode` | `string` | 否 | 网络同步策略：`"client_only"`（仅客端生效）、`"server_only"`（仅服务端）或 `"dual_sided"`（双端必须同步安装） |
| `dependencies` | `object` | 否 | 前置模组依赖字典，例如 `{"core_lib": ">=1.0.0"}` |
| `permissions` | `string[]`| 否 | 声明模组需要申请的受限权限清单（如 `network_mod_packet`） |

---

## 4. 下一步阅读指引

- 想要配置本地开发环境并使用一键脚手架？请阅读 [CLI 工具链与工程配置](/modding/cli-toolchain/)。
- 零代码创作文案与日常切片？请阅读 [Tier 1: 纯数据切片开发](/modding/tier1-data/)。
- 编写双端互动玩法与动态事件？请阅读 [Tier 2: 双端脚本沙盒开发](/modding/tier2-script/)。
- 深度魔改引擎、插入房间门与自定义 UI？请阅读 [Tier 3: 原生 PCK 全权基类](/modding/tier3-native/)。
- 查询所有接口函数签名？请阅读 [全量 API 字典速查](/modding/api/)。
