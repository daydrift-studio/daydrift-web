---
title: 创作者 CLI 工具链与工程配置
description: 使用 ddmod_cli.py 命令行工具实现模组脚手架初始化、合规静态审计、打包发布与热链接调试
---

为了降低模组创作者的技术门槛并统一社区规范，官方 Mod SDK 提供了跨平台命令行工具 `ddmod_cli.py`。该工具采用 Python 3 标准库编写，**无任何第三方依赖（无需安装 pip 包）**，可在 Windows、macOS 与 Linux 终端开箱即用。

---

## 1. 工具链获取与运行准备

1. 从官方 [daydrift-mod-sdk](https://github.com/daydrift-studio/daydrift-mod-sdk) 仓库克隆或直接下载 `sdk/ddmod_cli.py`；
2. 确保系统已安装 Python 3.10 或更高版本；
3. 在终端验证工具可用性：
   ```bash
   python sdk/ddmod_cli.py --help
   ```

---

## 2. 核心子命令与实战指南

`ddmod_cli.py` 覆盖模组从创建、审计、调试到发布的全生命周期：

### 2.1 一键初始化工程 (`init`)

根据指定的模组体系（Tier 1/2/3），一键生成符合规范的目录骨架、预制代码、清单配置以及 VSCode 补全文件：

```bash
# 初始化 Tier 1 纯数据模组
python sdk/ddmod_cli.py init my_story_pack --tier 1 --name "初晨往事" --author "悠然"

# 初始化 Tier 2 双端脚本模组
python sdk/ddmod_cli.py init my_weather_mod --tier 2 --name "微风气象站" --author "旅人"

# 初始化 Tier 3 原生 PCK 模组
python sdk/ddmod_cli.py init my_arcade_room --tier 3 --name "街机小天地" --author "极客"
```

#### 生成的文件树解构

```text
my_mod_project/
├── .vscode/
│   └── settings.json          # 预设 Schema 校验与 Lua 代码补全配置
├── manifest.json              # 模组元数据清单
├── preview.png                # 模组预览图存根 (1280x720)
├── narrative/                 # 叙事切片目录 (Tier 1/2)
│   └── interaction_example.json
├── data/                      # 翻译与多语言目录 (Tier 1/2)
│   └── i18n/
│       └── translations.csv
├── scripts/                   # 脚本逻辑目录 (Tier 2)
│   └── main.lua
└── entry.gd                   # GDScript 原生入口类 (Tier 3)
```

---

### 2.2 静态合规审计 (`validate`)

在打包发布前，运行静态审计命令检查模组是否存在格式错误、越界行为或安全隐患：

```bash
python sdk/ddmod_cli.py validate path/to/my_mod
```

审计器将自动执行以下深度合规检查：
1. **清单完整性**：验证 `manifest.json` 是否包含所有必填字段（`id`, `name`, `version`, `author`, `tier`, `type`）；
2. **标识符规范**：`id` 必须仅包含全小写英文字母、数字和下划线，长度在 1 至 64 个字符之间；
3. **版本号语义**：`version` 必须严格遵循 SemVer 语义化版本规则（例如 `1.0.0` 或 `0.1.0-alpha`）；
4. **入口文件存在性**：校验 `entry` 所指向的脚本文件是否存在；
5. **路径逃逸拦截**：遍历所有内部引用的相对路径，严厉拦截包含 `..` 的路径穿越行为；
6. **高危二进制文件拦截**：全面扫描模组目录，若发现非授权的 `.exe`、`.dll`、`.so`、`.bat`、`.cmd`、`.sh` 等二进制可执行文件，立即报告严重安全违规并阻断审计。

---

### 2.3 规范打包输出 (`pack`)

在通过静态审计的前提下，将模组压缩为标准 `.ddmod` 分发归档，并自动计算输出 SHA-256 哈希值：

```bash
python sdk/ddmod_cli.py pack path/to/my_mod --out-dir ./dist
```

- 输出产物：`dist/my_mod_v1.0.0.ddmod`
- 终端打印该包的确定性 SHA-256 摘要（可直接用于填写官方商店投稿单）。

---

### 2.4 开发热链接调试 (`dev-link`)

在日常编码调试时，频繁打包和复制文件效率低下。`dev-link` 命令能将开发目录直接软链接至当前操作系统的游戏 `mods/` 目录中：

```bash
python sdk/ddmod_cli.py dev-link path/to/my_mod
```

- **实现机制**：在 Windows 上优先建立软链接或硬目录联接（Junction），在 macOS/Linux 上创建符号链接（Symlink）；
- **即改即测**：你在编辑器中保存代码或 JSON 后，在游戏内「模组管理」菜单中点击重新加载，即可秒级观察到变更。

---

## 3. VSCode 智能提示与现代 IDE 配置

为了在编写 JSON 与脚本时获得字段提示、自动补全与类型检查，请在项目根目录的 `.vscode/settings.json` 中配置如下内容：

```json
{
  "json.schemas": [
    {
      "fileMatch": ["/manifest.json"],
      "url": "https://daydrift-docs.blym.top/schemas/manifest.schema.json"
    },
    {
      "fileMatch": ["/narrative/*.json"],
      "url": "https://daydrift-docs.blym.top/schemas/slice.schema.json"
    }
  ],
  "Lua.workspace.library": [
    "path/to/daydrift-mod-sdk/definitions"
  ],
  "Lua.diagnostics.globals": [
    "ModAPI",
    "ServerAPI"
  ]
}
```

### 推荐 VSCode 扩展组合
1. **Even Better TOML** / **JSON Tools**：高亮与验证清单配置；
2. **Lua by sumneko**：配合 `client_mod_api.d.lua` 与 `server_mod_api.d.lua`，提供全量浮窗文档与智能代码补全；
3. **Godot Tools** (适用于 Tier 3 原生开发)：支持 GDScript 语法高亮与 Godot 4 语言服务器联调。
