---
title: ModAPI 接口参考
description: 官方沙箱核心门面接口 ModAPI 完整定义
---

在模组脚本中，所有游戏能力均封装于全局安全门面 `ModAPI` 中。严禁直接访问底层操作系统或未经授权的文件系统。

## 1. 叙事对话与轻量提示

### `ModAPI.say(text, speaker?)`
弹出对白或内心独白气泡。
- `text` (string): 对白正文内容；
- `speaker` (string, 可选): 讲述者名称（默认为 `"我"`）。

### `ModAPI.choice(speaker, text, choices, callback_func_name?)`
向玩家弹出多分支选项对话框。
- `speaker` (string): 提问者名称；
- `text` (string): 提示语；
- `choices` (string[]): 选项文本数组；
- `callback_func_name` (string, 可选): 玩家点击后回调的脚本函数名。

### `ModAPI.add_choice(target_id, choice_text, callback_func_name)`
向场景交互物体注入额外的互动选项。
- `target_id` (string): 物体 ID（如 `"kettle"`、`"window"`、`"bed"`）；
- `choice_text` (string): 选项文本（如 `"[模组] 冲泡一杯热咖啡"`）；
- `callback_func_name` (string): 点击后执行的本地函数名。

### `ModAPI.toast(message)`
在屏幕顶栏弹出点阵风格的轻量化气泡通知。

---

## 2. 世界时钟与四时状态

### `ModAPI.get_day()` -> integer
返回当前游戏生存天数（从 1 开始递增）。

### `ModAPI.get_period()` -> integer
获取当前离散时段枚举整数：
- `0`: 清晨 (Dawn)
- `1`: 正午 (Noon)
- `2`: 傍晚 (Dusk)
- `3`: 深夜 (Midnight)

### `ModAPI.get_period_name()` -> string
获取当前时段的可读本地化名称（例如 `"清晨"`）。

### `ModAPI.advance_time()`
将当前世界时段推移一个档位。

### `ModAPI.get_flag(key, default_value?)` / `ModAPI.set_flag(key, value)`
跨场景读写全局场景黑板标记。

---

## 3. 隔离持久化数据存储

### `ModAPI.get_data(key, default_value?)` / `ModAPI.set_data(key, value)`
读写本模组专有命名空间下的持久化存储，与游戏本体核心存档安全隔离。
