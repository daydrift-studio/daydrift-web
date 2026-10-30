---
title: Tier 3 原生 PCK 模组与 DaydriftNativeMod 全权开发手册
description: 掌握 100% 原生代码等价控制力，利用 DaydriftNativeMod 深入 Godot 引擎层、注入物理房间门、热替换脚本与全自动安全回滚
---

**Tier 3 原生 PCK 模组（Native PCK）** 是《度日：Daydrift》模组体系中的终极扩展形态。它为独立游戏开发者与深度魔改工程师赋予了**“100% 游戏原生代码等价（Full Native Code Equivalence）”**的绝对控制力。

通过继承核心基类 `DaydriftNativeMod`，模组不再受限于沙盒 API 白名单，而是作为**一等公民（First-class Citizen）**直接挂载在场景树根节点 `/root` 下，可自由支配底层渲染管线、物理碰撞、帧循环、多语言服务器与联机信令。

---

## 1. 架构理念与一等公民设计

当游戏内核挂载 Tier 3 的 `.pck` 编译资源包后，其实例化节点直接入驻场景树根部：
- **常驻帧循环**：默认设置 `process_mode = Node.PROCESS_MODE_ALWAYS`，即使游戏处于暂停态或转场动画中，模组依旧拥有帧处理权；
- **全生命周期托管追踪**：基类内置完善的托管注册表，模组在停用或热重载时，自动执行 `_rollback_all_managed_changes()`，实现**零残留干净回滚（Zero-Residue Rollback）**，彻底避免内存泄漏或场景脏污染。

---

## 2. 全域 Autoload 单例与引擎核心直达引用

无需繁琐的反射或动态搜索，基类在进入场景树时直接强类型绑定了游戏全部核心单例与服务：

```gdscript
extends DaydriftNativeMod

func _ready() -> void:
    # 1. 引擎主循环与窗口服务
    var current_tree: SceneTree = tree              # 直达 get_tree()
    var window: Window = root_window                # 直达 get_tree().root
    
    # 2. 全域信号总线 (可直接连接、发射任意内置信号或动态扩展信号)
    event_bus.emit_signal("hud_toast_requested", "原生引擎模组已接管！")
    
    # 3. 世界时钟与四时流转
    var current_day: int = time_manager.current_day
    var period: int = time_manager.current_period
    
    # 4. 原生存档与状态黑板
    save_manager.set_blackboard("custom_engine_key", 42)
    
    # 5. 音频服务器与混音总线
    audio_manager.play_sfx("res://assets/sfx/bell.ogg")
    
    # 6. 转场与黑场控制
    # scene_transition.fade_to_black(0.5)
    
    # 7. 模组管理器 (可跨 Mod 协同调用其他已激活模组实例)
    var other_mod = mod_manager.get_active_mod("another_mod_id")
    
    # 8. 网络管理器与底层信令
    # network_manager.send_packet(...)
    
    # 9. 本地局域网房主广播服务
    # lan_host_manager.broadcast_presence()
```

---

## 3. 原生帧循环与全生命周期拦截钩子

子类除了可直接重写 Godot 原生 `_process(delta)`、`_physics_process(delta)`、`_input(event)` 外，基类额外提供了 10 个深度生命周期拦截虚函数：

```gdscript
extends DaydriftNativeMod

## 1. PCK 挂载完毕后第 0 帧触发（早于入树，适于资源接管与全局翻译注入）
func _on_mod_init() -> void:
    print("[Mod] PCK 挂载完毕，初始化开始")

## 2. 模组节点进入场景树就绪时触发
func _on_mod_enable() -> void:
    print("[Mod] 模组已正式激活入树")

## 3. 场景树中任意节点加入时第 0 帧触发（全场景穿透检测玩家、NPC、UI按钮）
func _on_node_added_anywhere(node: Node) -> void:
    if node.is_in_group("player"):
        print("[Mod] 玩家实体进入场景树: ", node.name)
        # 可直接修改玩家属性、挂载新光环子节点或动态替换脚本

## 4. 主场景（如 bedroom、street 或自定义新场景）切换并就绪后触发
func _on_scene_ready(scene_id: String, scene_root: Node) -> void:
    print("[Mod] 场景已就绪: %s (根节点: %s)" % [scene_id, scene_root])

## 5. 四时时段更迭时触发 (0: 清晨, 1: 正午, 2: 傍晚, 3: 深夜)
func _on_period_changed(day: int, new_period: int, period_name: String) -> void:
    print("[Mod] 四时更迭: 第 %d 天 %s" % [day, period_name])

## 6. 跨天结算进入新一天时触发
func _on_day_advanced(new_day: int) -> void:
    print("[Mod] 跨入新的一天: 第 %d 天" % new_day)

## 7. 原生存档写入磁盘前触发（可直接向 save_data 字典注入私有全局数据）
func _on_before_save(save_data: Dictionary) -> void:
    save_data["my_mod_custom_state"] = {"karma": 100}

## 8. 原生读档解析完成后触发
func _on_after_load(save_data: Dictionary) -> void:
    if save_data.has("my_mod_custom_state"):
        print("[Mod] 读取到自定义存档状态: ", save_data["my_mod_custom_state"])

## 9. 收到联机模组自定义报文时触发
func _on_net_packet(sender_id: String, channel: String, payload: Dictionary) -> void:
    print("[Mod] 收到来自 %s 的信道 [%s] 报文: %s" % [sender_id, channel, payload])

## 10. 模组在管理面板被停用或热重载前触发（自动触发全量无感知回滚）
func _on_mod_disable() -> void:
    print("[Mod] 模组即将停用，回滚所有修改")
    super._on_mod_disable()
```

---

## 4. 原生资源热替换与 Monkey Patching

支持一行代码无感替换游戏本体的任何 `.gd` 脚本、`.tscn` 场景、贴图、字体或着色器，并在卸载模组时自动复原：

### 4.1 虚拟路径接管 (`hijack_resource`)

```gdscript
# 用模组自定义的街景场景彻底接管原版卧室场景
var new_bedroom_scene = load("res://mods/my_mod/custom_bedroom.tscn")
hijack_resource("res://src/locations/bedroom/bedroom.tscn", new_bedroom_scene)
```
- **原理**：调用底层 `Resource.take_over_path()`，并在模组内部备份原版资源。模组停用时自动重新接管回原版资源。

### 4.2 运行时挂载脚本热替换 (`patch_node_script`)

```gdscript
# 替换场上已存在的 Player 实体脚本，并自动保留原有属性变量
var new_player_script = load("res://mods/my_mod/super_player.gd")
patch_node_script(player_instance, new_player_script, true)
```

### 4.3 动态注册全局单例 (`register_custom_autoload`)

```gdscript
var helper_service = MyCustomHelperNode.new()
register_custom_autoload("MyModService", helper_service)
# 之后在场景树任何位置均可通过 get_node("/root/MyModService") 访问
```

---

## 5. 多语言覆写与对话框拦截

### 5.1 动态覆盖游戏词条
```gdscript
# 覆写原版 UI 或对白词条
override_tr("zh_CN", "UI_PAUSE_MENU", "小憩片刻")
override_tr("en_US", "UI_PAUSE_MENU", "Take a Break")

# 批量覆写
override_tr_batch("zh_CN", {
    "BEDROOM_BED_PROMPT": "[魔改] 倒头就睡",
    "STREET_NAME": "常青漫步大道"
})

# 一键挂载模组内置 CSV 翻译
load_csv_translations("res://mods/my_mod/i18n.csv")
```

### 5.2 全局对话拦截器 (`register_dialogue_interceptor`)
在游戏对话框渲染前实时劫持对白内容：

```gdscript
register_dialogue_interceptor(func(ctx: Dictionary) -> Dictionary:
    # ctx 包含: speaker, text, choices
    if ctx.get("speaker") == "kettle":
        ctx["text"] = ctx.get("text", "") + " (水壶发出了愉快的鸣响声)"
    return ctx
)
```

---

## 6. 世界实体构建、物理房间门与 UI 注入

### 6.1 动态生成物理实体房间门 (`spawn_physical_door`)

在原版场景中凭空生成一扇带物理碰撞体、交互检测区、悬浮提示并支持场景转场的实体门（`RoomDoor`）：

```gdscript
func _on_scene_ready(scene_id: String, scene_root: Node) -> void:
    if scene_id == "street":
        # 在街道 (850, 420) 处生成一扇通往地下街机室的物理门
        var door = spawn_physical_door(
            "street",                             # 目标挂载场景 ID
            Vector2(850, 420),                    # 门在街道上的物理坐标
            "arcade_room",                        # 传送目标地点 ID
            Vector2(120, 300),                    # 传送后玩家的生成坐标
            "进入地下街机室"                       # 交互气泡提示文本
        )
```

### 6.2 动态挂载全屏后处理 Shader (`add_screen_post_shader`)

无需修改主摄像机，直接向全域视口挂载全屏屏幕滤镜（如雨丝水雾、老电视 CRT 扫描线）：

```gdscript
var mat = ShaderMaterial.new()
mat.shader = load("res://mods/my_mod/crt_scanline.gdshader")
var screen_layer = add_screen_post_shader(10, mat)
```

### 6.3 注入原生 UI 界面 (`mount_ui_node`)

将自定义的 HUD 挂件注入原生界面的指定节点下（支持 `"MainMenu"`、`"InGameHUD"`、`"PauseDrawer"` 等预设别名或 `/root/...` 绝对节点路径）：

```gdscript
# 挂载至游戏内主 HUD
var custom_clock = load("res://mods/my_mod/custom_clock.tscn").instantiate()
mount_ui_node("InGameHUD", custom_clock)

# 挂载至局内 Esc 暂停抽屉
var mod_extra_tab = load("res://mods/my_mod/pause_tab.tscn").instantiate()
mount_ui_node("PauseDrawer", mod_extra_tab)
```

### 6.4 便捷提示、叙事与分支交互 (`toast`, `say`, `choice`)

基类内置了与游戏原生对话系统完全接通的快捷助手函数：

```gdscript
# 1. 弹出屏幕顶栏像素提示
toast("已拾取模组神秘道具：古旧咖啡豆！")

# 2. 调起原版剧情对白框（单参数默认为内心独白，双参数指定说话人）
say("店长", "外面的雨渐渐小了，要来一杯热咖啡吗？")

# 3. 弹出多分支选项对话框并接收回调
choice("店长", "今天想品尝哪种烘焙度的豆子？", ["浅烘耶加雪菲", "中烘哥伦比亚", "深烘曼特宁"], func(index: int):
    match index:
        0: toast("选择了明亮花果香气的浅烘")
        1: toast("选择了坚果焦糖风味的中烘")
        2: toast("选择了醇厚浓郁的深烘")
)
```

### 6.5 联机双端信令广播 (`send_net_packet`)

```gdscript
# 向房间内其他旅人广播自定义信道数据包
send_net_packet("custom_weather", {
    "weather": "misty_rain",
    "intensity": 0.8
})
```

---

## 7. 零残留安全回滚体系 (Zero-Residue Rollback)

基类内置了四大安全回滚容器：
1. `_managed_resource_hijacks`：记录所有被接管的资源路径，卸载时恢复原版引用；
2. `_managed_script_patches`：记录所有被替换脚本的节点与原始脚本，卸载时原样换回；
3. `_managed_signals`：记录所有通过 `connect_managed()` 建立的信号监听，卸载时逐一安全断开；
4. `_managed_children`：记录所有通过 `add_child_managed()` 动态生成的子节点与实体（包含物理房间门、HUD 挂件、后处理着色器），卸载时全部自动调用 `queue_free()` 销毁。

创作者只需规范使用基类辅助方法，即可确保模组热插拔时**绝对不污染游戏内存与主场景**。

---

## 8. PCK 编译与工程导出流程

1. 使用与游戏内核匹配的 **Godot 4.3+** 编辑器；
2. 在项目设置中创建独立目录（例如 `res://mods/my_arcade/`）；
3. 编写 `entry.gd` 继承 `DaydriftNativeMod`；
4. 在 Godot 中配置导出预设：
   - 勾选仅导出指定目录；
   - 导出模式选择 **「导出 PCK/ZIP (Export PCK/ZIP)」**，命名为 `my_mod.pck`；
5. 在外层编写包含 `manifest.json` 的模组工程，并使用 `ddmod_cli.py pack` 输出 `.ddmod`。
