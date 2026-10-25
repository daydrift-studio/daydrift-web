---
title: 模组创作概览
description: 了解《度日：Daydrift》模组架构与开发准备
---

《度日：Daydrift》拥有开放、模块化且安全的模组系统。你可以通过轻量级的数据配置（Data Mod）或沙箱化的 Lua 脚本（Script Mod）扩展游戏内容。

## 核心仓库与工具

- **官方 Mod SDK**：[daydrift-studio/daydrift-mod-sdk](https://github.com/daydrift-studio/daydrift-mod-sdk)
- **Mod 商店与投稿**：[daydrift-studio/daydrift-mods](https://github.com/daydrift-studio/daydrift-mods)

## 模组目录解构

一个标准的《度日》模组是一个独立文件夹，解压后根目录包含：

```text
my_awesome_mod/
├── manifest.json              # 必须：核心元数据清单
├── preview.webp               # 可选：模组封面 (建议 1280x720)
├── scripts/                   # 可选：Lua 业务逻辑
│   └── main.lua
└── narrative/                 # 可选：日常交互配置
    └── interactions.json
```

## 清单文件 `manifest.json`

```json
{
  "id": "my_first_mod",
  "name": "我的第一个日常模组",
  "version": "1.0.0",
  "author": "创作者名称",
  "description": "在街道旁增加一处可阅读的旧书摊。",
  "type": "data",
  "priority": 10,
  "net_sync_mode": "client_only"
}
```

更多高级接口，请查阅 [ModAPI 接口参考](/modding/api/)。
