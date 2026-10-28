---
title: 模组开发常见报错与自愈调试手册
description: 常见 GDScript 语法报错、Lua 沙盒配额熔断、签名校验失败与 booting.lock 崩溃自愈排查指南
---

在模组开发、测试与签名打包过程中，可能会遇到引擎语法、沙盒限制或验签阻断等报错。本文档汇编了高频问题的原因与标准解决方案。

---

## 1. 原生引擎与 GDScript 常见报错 (Tier 3)

### 1.1 `Class "X" hides an autoload singleton`
- **错误原因**：自定义的类名（`class_name X`）与游戏在 `project.godot` 中注册的全局单例（Autoload）名称完全重名，引发命名空间冲突。
- **解决方案**：为自定义类名添加前缀（如 `class_name GlobalUpdateChecker`）或移除重名的 `class_name` 声明，仅通过脚本路径实例化。

### 1.2 `Identifier "MODS_DIR" not declared in current scope`
- **错误原因**：直接引用了已废弃的常量，未通过统一的目录探测函数获取用户路径。
- **解决方案**：使用 `get_primary_mods_dir()` 或保持兼容性常量定义 `const MODS_DIR = "user://mods"`.

### 1.3 `Function "_func_name()" not found in base self`
- **错误原因**：子类调用了未在基类中实现的私有辅助方法，或参数签名不匹配。
- **解决方案**：查阅 [API 字典速查](/modding/api/)，确保调用的方法签名与 `DaydriftNativeMod` 官方定义严格一致。

---

## 2. Lua 沙盒虚拟机报错 (Tier 2)

### 2.1 `instruction quota exceeded (virtual CPU limit)`
- **错误原因**：Lua 脚本单次回调执行的指令数量超过了安全配额（默认 100,000 次操作码），通常由于未加休眠的 `while true do` 死循环或过深递归引起。
- **解决方案**：
  - 避免在单帧内执行密集遍历；
  - 善用游戏事件驱动模型（如 `on_interacted`、`on_period_changed`），而不是在循环中盲目轮询；
  - 耗时运算应拆分至多帧执行。

### 2.2 `attempt to call a nil value (global 'os' / 'io')`
- **错误原因**：Lua 脚本试图访问系统级文件或进程（如 `os.execute`、`io.open`）。为了保护玩家系统安全，沙盒在初始化时彻底剥离了这些敏感模块。
- **解决方案**：
  - 文件持久化请调用 `ModAPI.set_data(key, val)`；
  - 游戏数据读写请使用 `ModAPI.get_flag` / `set_flag`；
  - 资源加载请使用 `ModAPI.resolve_path(rel_path)`。

---

## 3. 模组打包与 Ed25519 签名审计报错

### 3.1 `digest-mismatch (哈希不匹配)`
- **错误原因**：最常见于 Windows 开发者！Git 自动将代码中的换行符转换为 Windows 格式（`CRLF`，`\r\n`），导致计算的 SHA-256 摘要与 Linux / macOS 运行环境（`LF`，`\n`）不同。
- **解决方案**：
  - 在模组根目录添加 `.gitattributes` 文件，强制声明统一换行符：
    ```text
    * text=auto eol=lf
    ```
  - 使用官方工具链 `ddmod_cli.py pack` 打包，工具内置跨平台 LF 归一化逻辑，确保全平台摘要一致。

### 3.2 `mod-mismatch (清单与签名不一致)`
- **错误原因**：修改了 `manifest.json` 中的 `id` 或 `version` 后，未重新运行签名工具。
- **解决方案**：每次递增版本号后，重新运行 `node tools/sign.mjs path/to/mod`。

### 3.3 `unsafe-tree (检测到不安全的文件树结构)`
- **错误原因**：
  - 存在相对路径穿越（如 `../secret.txt`）；
  - 存在文件名大小写冲突（如同时存在 `Icon.png` 和 `icon.png`）；
  - 包含非法的系统快捷方式或软链接（Symlink）。
- **解决方案**：规范模组文件命名，保持全小写字母，清理快捷方式文件。

---

## 4. 游戏启动崩溃自愈排查 (`booting.lock`)

如果本地开发的模组存在严重底层致命崩溃，游戏会在下次启动时自动进入**「安全恢复模式」**：
1. **控制台日志提取**：
   - Windows 路径：`%APPDATA%/Godot/app_userdata/Daydrift/logs/godot.log`
   - Linux 路径：`~/.local/share/godot/app_userdata/Daydrift/logs/godot.log`
2. **定位崩溃根因**：搜索日志末尾的 `SCRIPT ERROR` 或 `CrashHandler` 堆栈；
3. **解除隔离**：修复代码后，在游戏启动菜单点击「重新激活模组」即可恢复正常加载。
