---
title: ModAPI 接口参考
description: 《度日：Daydrift》Mod 安全沙箱门面接口与生命周期完整定义（自动同步自 mod_api.d.lua）
---

在模组脚本中，所有游戏能力均封装于全局安全门面 `ModAPI` 中。严禁直接访问底层操作系统或未经授权的文件系统。

本文档由 `types/mod_api.d.lua` 自动提取生成，并严格通过 CI 一致性校验（函数数量：19）。

## 1. 叙事对话与轻量提示 (Narrative & Dialogue)

### `ModAPI.say(text, speaker)`

在游戏画面中弹出对白或内心独白

**参数：**

- `text` (`string`): 对白正文内容
- `speaker` (`string` *(可选)*): 讲述者名字（默认 "我"）

---

### `ModAPI.choice(speaker, text, choices, callback_func_name)`

向玩家展示多分支选项对话框

**参数：**

- `speaker` (`string`): 讲述者名字
- `text` (`string`): 提问或前置对白
- `choices` (`string[]|table[]`): 分支选项文本数组，或包含 id 与 text 的字典数组
- `callback_func_name` (`string` *(可选)*): 玩家点击选项后回调的函数名（接收选项索引与数据）

---

### `ModAPI.add_choice(target_id, choice_text, callback_func_name)`

向场景交互物体（如 "kettle", "window", "bed"）注入额外的互动选项

**参数：**

- `target_id` (`string`): 交互物体 ID（例如 "kettle"）
- `choice_text` (`string`): 选项展示文本（例如 "[模组] 冲泡一杯热挂耳咖啡"）
- `callback_func_name` (`string`): 点击该选项后调用的本地函数名

---

### `ModAPI.toast(message)`

在屏幕顶部弹出轻量化点阵气泡通知

**参数：**

- `message` (`string`): 提示文本

---

## 2. 世界时钟与四时状态 (World & Time)

### `ModAPI.get_day()`

获取当前游戏生存天数（从 1 开始累加）

**返回值：**

- `integer` `day`: 当前天数

---

### `ModAPI.get_period()`

获取当前离散时段枚举整数 (0: 清晨, 1: 正午, 2: 傍晚, 3: 深夜)

**返回值：**

- `integer` `period`: 当前时段数值 (0-3)

---

### `ModAPI.get_period_name()`

获取当前时段的可读本地化名称（例如 "清晨", "正午", "傍晚", "深夜"）

**返回值：**

- `string` `period_name`: 时段中文名称

---

### `ModAPI.advance_time()`

将当前世界时段推进一个档位（清晨 -> 正午 -> 傍晚 -> 深夜 -> 次日清晨）

---

### `ModAPI.get_flag(key, default_value)`

获取全局场景黑板标记（跨场景共享状态）

**参数：**

- `key` (`string`): 状态键名
- `default_value` (`any` *(可选)*): 若键不存在时的默认返回值

**返回值：**

- `any` `value`: 存储的状态值

---

### `ModAPI.set_flag(key, value)`

写入全局场景黑板标记

**参数：**

- `key` (`string`): 状态键名
- `value` (`any`): 需要保存的值

---

## 3. 隔离持久化存档 (Isolated Mod Storage)

### `ModAPI.get_data(key, default_value)`

读取本 Mod 私有命名空间下的持久化数据（与原版核心存档完全隔离）

**参数：**

- `key` (`string`): 键名
- `default_value` (`any` *(可选)*): 默认值

**返回值：**

- `any` `value`: 存储的值

---

### `ModAPI.set_data(key, value)`

写入本 Mod 私有命名空间下的持久化数据

**参数：**

- `key` (`string`): 键名
- `value` (`any`): 需要保存的值

---

## 4. 资源加载与生命周期钩子规范 (Lifecycle Hooks)

### `ModAPI.load_texture(rel_path)`

动态加载 Mod 内部的 PNG 贴图资源（免 .import 缓存，缺失时自动回退占位图）

**参数：**

- `rel_path` (`string`): 相对于本 Mod 根目录的相对路径（严禁包含 ".."）

**返回值：**

- `any` `texture`: 纹理对象引用

---

### `ModAPI.load_audio(rel_path)`

动态加载 Mod 内部的 OGG 音频流资源

**参数：**

- `rel_path` (`string`): 相对于本 Mod 根目录的相对路径

**返回值：**

- `any` `audio_stream`: 音频流对象引用

---

## 5. 标准生命周期回调函数 (Lifecycle Hooks)

创作者在 Mod 主脚本中直接实现以下顶级函数，游戏主循环在特定时机将自动回调：

### `on_loaded()`

当 Mod 装载进游戏内存时触发

---

### `on_period_changed(prev_period, curr_period)`

当时段发生更迭推进时触发

**参数：**

- `prev_period` (`integer`): 变更前时段 (0-3)
- `curr_period` (`integer`): 变更后时段 (0-3)

---

### `on_day_advanced(current_day)`

当深夜结算并跨入新的一天时触发

**参数：**

- `current_day` (`integer`): 新的一天数

---

### `on_interacted(target_id)`

当主角在场景中与特定生活物件交互时触发

**参数：**

- `target_id` (`string`): 交互点 ID (如 "kettle", "window", "bed", "street_bench")

---

### `on_scene_entered(scene_path)`

当进入新场景加载完毕时触发

**参数：**

- `scene_path` (`string`): 场景路径标识

---

