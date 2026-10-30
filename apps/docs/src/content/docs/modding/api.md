---
title: 全量 API 字典速查
description: 《度日：Daydrift》模组系统全量接口速查表，涵盖客户端 ModAPI、服务端 ServerAPI 与原生 DaydriftNativeMod
---

本文档归纳了《度日：Daydrift》模组生态的三大核心 API 字典。

---

## 1. 客户端 Lua 沙盒接口 (`ModAPI`)

在客户端 Lua 脚本中，全局对象 `ModAPI` 提供受控操作能力。

### 1.1 叙事、对话与轻量提示

| 函数签名 | 说明 | 参数列表 |
| :--- | :--- | :--- |
| `ModAPI.say(text, speaker)` | 在游戏画面中弹出对白或内心独白 | `text: string`, `speaker?: string` (默认 `"我"`) |
| `ModAPI.choice(speaker, text, choices, callback)` | 向玩家展示多分支选项对话框 | `speaker: string`, `text: string`, `choices: string[]`, `callback: string` |
| `ModAPI.add_choice(target_id, choice_text, callback)` | 向原生交互物体（如 kettle, window）注入额外互动选项 | `target_id: string`, `choice_text: string`, `callback: string` |
| `ModAPI.toast(message)` | 在屏幕顶部弹出点阵气泡通知 | `message: string` |

### 1.2 世界时钟与四时状态

| 函数签名 | 说明 | 返回值 |
| :--- | :--- | :--- |
| `ModAPI.get_day()` | 获取当前游戏生存天数（从 1 开始累加） | `integer` 当前天数 |
| `ModAPI.get_period()` | 获取当前离散时段数值 (0: 清晨, 1: 正午, 2: 傍晚, 3: 深夜) | `integer` (0-3) |
| `ModAPI.get_period_name()` | 获取当前时段的可读本地化名称（如 "清晨", "正午"） | `string` |
| `ModAPI.advance_time()` | 将世界时钟推进一个档位 | `nil` |

### 1.3 数据持久化与场景黑板

| 函数签名 | 说明 | 参数列表 / 返回值 |
| :--- | :--- | :--- |
| `ModAPI.get_flag(key, default)` | 获取当前场景的临时状态黑板标记 | `key: string`, `default?: any` -> `any` |
| `ModAPI.set_flag(key, val)` | 设置当前场景的临时状态黑板标记 | `key: string`, `val: any` |
| `ModAPI.get_data(key, default)` | 读取随主存档持久化保存的模组私有键值 | `key: string`, `default?: any` -> `any` |
| `ModAPI.set_data(key, val)` | 写入随主存档持久化保存的模组私有键值 | `key: string`, `val: any` |

### 1.4 全局事件与网络通信

| 函数签名 | 说明 | 参数列表 |
| :--- | :--- | :--- |
| `ModAPI.on_event(event_name, callback)` | 注册全局信号监听回调 | `event_name: string`, `callback: function` |
| `ModAPI.emit_event(event_name, payload)` | 向全局事件总线发射自定义事件 | `event_name: string`, `payload?: table` |
| `ModAPI.send_net_packet(channel, payload)` | 向联机房间发送自定义信道报文 | `channel: string`, `payload: table` |
| `ModAPI.on_net_packet(channel, callback)` | 监听来自服务端的自定义信道报文广播 | `channel: string`, `callback: function(sender_id, payload)` |
| `ModAPI.resolve_path(rel_path)` | 将模组相对路径解析为运行时绝对资源 URI | `rel_path: string` -> `string` |

---

## 2. 服务端 Lua 沙盒接口 (`ServerAPI`)

在独立服务端（Go Headless Server）中，全局对象 `ServerAPI` 承接联机管理与公共状态。

### 2.1 核心服务与广播

| 函数签名 | 说明 | 参数列表 |
| :--- | :--- | :--- |
| `ServerAPI.log(message)` | 向服务端终端与日志文件打印格式化信息 | `message: string` |
| `ServerAPI.broadcast(message)` | 向所有在线旅人的聊天频道发送系统公告 | `message: string` |
| `ServerAPI.get_time()` | 查询当前服务端世界时钟 | 返回 `{period: int, day: int}` |
| `ServerAPI.set_time(period, day)` | 强行重设服务端世界时钟并向全体广播同步 | `period: int`, `day: int` |

### 2.2 公共黑板与网络路由

| 函数签名 | 说明 | 参数列表 |
| :--- | :--- | :--- |
| `ServerAPI.Blackboard.get(key)` | 获取服务端公共数据黑板中的键值 | `key: string` -> `any` |
| `ServerAPI.Blackboard.set(key, val, broadcast)` | 写入公共黑板，可指定是否向房间广播 | `key: string`, `val: any`, `broadcast?: boolean` |
| `ServerAPI.Net.send(peer_id, channel, payload)` | 单播：向指定旅人发送自定义信道报文 | `peer_id: string`, `channel: string`, `payload: table` |
| `ServerAPI.Net.broadcast(channel, payload)` | 广播：向所有在线旅人发送自定义信道报文 | `channel: string`, `payload: table` |
| `ServerAPI.Commands.register(name, desc, handler)` | 注册玩家聊天指令 (以 `/` 开头) 或后台控制台指令 | `name: string`, `desc: string`, `handler: function(peer_id, args) -> string` |

### 2.3 全局生命周期回调函数（子脚本定义）

| 回调函数签名 | 触发时机 | 参数说明 |
| :--- | :--- | :--- |
| `on_player_join(peer_id, nickname)` | 新旅人成功进入房间时触发 | `peer_id: string`, `nickname: string` |
| `on_player_leave(peer_id)` | 旅人断开连接离开房间时触发 | `peer_id: string` |
| `on_time_advanced(period, day)` | 服务端四时流转或跨天结算时触发 | `period: integer`, `day: integer` |
| `on_chat(peer_id, nickname, message)` | 玩家在公屏发送聊天消息时触发（可用于敏感词过滤或拦截） | `peer_id: string`, `nickname: string`, `message: string` -> 可返回修改后的字符串或 `false` 拦截 |
| `on_net_packet(peer_id, channel, payload)` | 收到来自客户端的模组自定义网络报文时触发 | `peer_id: string`, `channel: string`, `payload: table` |

---

## 3. 原生 GDScript 基类 (`DaydriftNativeMod`)

面向 Tier 3 原生 PCK 模组的 `DaydriftNativeMod`（`extends Node`）核心成员定义：

### 3.1 核心服务属性（零反射直达）

```gdscript
var tree: SceneTree                  # 直达 get_tree()
var root_window: Window              # 直达 get_tree().root
var event_bus: Node                  # 直达 /root/EventBus
var time_manager: Node               # 直达 /root/TimeManager
var save_manager: Node               # 直达 /root/SaveManager
var audio_manager: Node              # 直达 /root/AudioManager
var scene_transition: Node           # 直达 /root/SceneTransition
var mod_manager: Node                # 直达 /root/ModManager
var network_manager: Node            # 直达 /root/NetworkManager
var lan_host_manager: Node           # 直达 /root/LanHostManager
```

### 3.2 生命周期拦截虚函数

| 虚函数声明 | 说明 |
| :--- | :--- |
| `func _on_mod_init() -> void` | PCK 资源包挂载后、节点尚未入树时第 0 帧触发 |
| `func _on_mod_enable() -> void` | 模组节点入树激活并就绪时触发 |
| `func _on_node_added_anywhere(node: Node) -> void` | 场景树中任意节点加入时第 0 帧触发（穿透检测玩家、NPC、UI） |
| `func _on_scene_ready(scene_id: String, scene_root: Node) -> void` | 主场景切换完成并就绪时触发 |
| `func _on_period_changed(day: int, new_period: int, period_name: String) -> void` | 四时更迭时触发 |
| `func _on_day_advanced(new_day: int) -> void` | 跨天结算进入新一天时触发 |
| `func _on_before_save(save_data: Dictionary) -> void` | 原生存档序列化写入前触发（可注入自定义字典字段） |
| `func _on_after_load(save_data: Dictionary) -> void` | 原生读档数据解析完成后触发 |
| `func _on_net_packet(sender_id: String, channel: String, payload: Dictionary) -> void` | 收到联机模组自定义报文时触发 |
| `func _on_mod_disable() -> void` | 模组停用或卸载前触发（自动触发全量无感知回滚） |

### 3.3 原生能力与世界构建方法

| 方法声明 | 功能描述 |
| :--- | :--- |
| `hijack_resource(target_res_path: String, replacement_res: Resource) -> void` | 强行接管 `res://` 任意路径资源，并在模组卸载时自动恢复原版 |
| `patch_node_script(target_node: Node, new_script: Script, preserve_state: bool = true) -> void` | 动态热替换场景中已存在节点的脚本，并保留原有属性值 |
| `register_custom_autoload(singleton_name: String, instance: Node) -> void` | 向 `/root` 动态注册全局单例，卸载时自动注销 |
| `override_tr(locale: String, key: String, new_text: String) -> void` | 动态覆盖或新增多语言词条 |
| `override_tr_batch(locale: String, translations_map: Dictionary) -> void` | 批量覆盖多语言词条字典 |
| `load_csv_translations(csv_res_path: String) -> Error` | 直接加载模组私有 CSV 翻译文件 |
| `register_dialogue_interceptor(interceptor: Callable) -> void` | 注册全局对话框文本拦截器 `func(ctx: Dictionary) -> Dictionary` |
| `spawn_physical_door(target_scene_id, pos, dest_loc_id, spawn_pos, label_tr) -> Node` | 在原版场景中生成具备物理碰撞与转场的实体门 |
| `spawn_interactable(target_scene_id, node_name, pos, tex, prompt_tr, on_interact) -> Node` | 在指定坐标生成带碰撞检测与气泡的交互物体 |
| `inject_interaction_choice(anchor_id, choice_tr, callback, condition) -> void` | 向原版家具或 NPC 注入自定义互动分支 |
| `add_screen_post_shader(layer: int, mat: ShaderMaterial) -> ColorRect` | 向全局视口挂载全屏后处理着色器滤镜 |
| `mount_ui_node(target_alias_or_path: String, control: Control) -> void` | 将自定义 UI 界面挂载到指定节点（支持 "MainMenu"、"InGameHUD"、"PauseDrawer"） |
| `toast(message: String) -> void` | 快速触发全域点阵像素浮层通知 |
| `say(speaker_or_text: String, text: String = "") -> void` | 调起原版剧情对白框展示台词或内心独白 |
| `choice(speaker: String, text: String, choices: Array, callback: Callable = Callable()) -> void` | 弹出多分支选项对话框并接收玩家输入回调 |
| `send_net_packet(channel: String, payload: Dictionary, target_peer: int = 0) -> void` | 向联机房间或指定对端发送自定义信道数据包 |
| `register_location(loc_id: String, scene_res: PackedScene) -> void` | 动态注册全新的可探索地点场景 |
| `register_or_override_npc(npc_id: String, schedule_dict: Dictionary, custom_scene: PackedScene = null) -> void` | 动态注册或覆盖 NPC 四时作息与出没场景 |
| `register_keybind(action_name: String, key: Key, joy_btn: JoyButton = JOY_BUTTON_INVALID) -> void` | 动态注册自定义输入动作与按键绑定 |
| `connect_managed(sig: Signal, callable: Callable, flags: int = 0) -> void` | 托管连接原生信号，模组卸载时自动断开 |
| `add_child_managed(parent: Node, child: Node) -> Node` | 托管添加子节点，模组卸载时自动调用 `queue_free()` 销毁 |
