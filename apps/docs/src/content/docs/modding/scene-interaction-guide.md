---
title: 三大生活场景交互与世界构建指南
description: 深入解析《度日：Daydrift》起居卧室、连绵街道与秘密物理房间门的三场景实战开发
---

《度日：Daydrift》的核心体验围绕着生活场景的驻足与流转展开。本文档详细解析游戏内**起居卧室 (`bedroom`)**、**连绵街道 (`street`)** 以及**自定义秘密空间 (`coffee_attic` / 自定义场景)**的三场景交互接入规范。

---

## 1. 场景一：起居卧室 (`bedroom`) 交互接入

卧室是旅人起居生活的核心场景，时间在此处由清晨展开，于深夜结算。

### 1.1 原生交互物件 ID 与锚点

| 物件 ID | 物件实体说明 | 原生动作 | 模组推荐扩展方向 |
| :--- | :--- | :--- | :--- |
| **`kettle`** | 起居室烧水壶 | 烧水冲泡动作 | 冲泡各产区咖啡、花茶，播放蒸汽白噪音 |
| **`bed`** | 卧室床榻 | 熄灯就寝跨天结算 | 睡前阅读、听雨沉思、梦境切片 |
| **`desk`** | 书桌与工作台 | 翻阅当前手记 | 撰写日记札记、整理收集物、绘制素描 |
| **`bedroom_window`**| 落地观景窗 | 眺望街道微光 | 监听雨声、观察窗外日出与夕阳四时天色 |
| **`exit_door`** | 通往街道的大门 | 场景转场至街道 | 检查出门随身物品、触发临别独白 |

### 1.2 卧室交互代码范例 (Lua 与 切片)

```lua
-- 向起居室水壶注入手冲咖啡选项
ModAPI.add_choice("kettle", "[模组] 冲泡深度烘焙曼特宁", function()
    ModAPI.toast("水汽蒸腾，微苦甘醇的咖啡香弥漫开来。")
    ModAPI.set_flag("brewed_coffee", true)
    local count = ModAPI.get_data("coffee_count", 0) + 1
    ModAPI.set_data("coffee_count", count)
end)
```

---

## 2. 场景二：长卷街道 (`street`) 交互接入

街道是横向拓展达 1440 像素的连绵景观长卷，包含复古铸铁街灯、林荫长椅、行道树与过往旅人。

### 2.1 原生交互物件 ID

| 物件 ID | 物件实体说明 | 特色机制 | 模组推荐扩展方向 |
| :--- | :--- | :--- | :--- |
| **`street_bench`** | 街道长椅 | 驻足坐下休憩 | 端咖啡沉思、阅读旧书信、触发旅人相遇对话 |
| **`street_lamp`** | 复古铸铁街灯 | 暖黄光晕投射 | 傍晚/深夜感悟、调节灯影滤镜、避雨停留 |
| **`door_to_bedroom`**| 返回卧室的门 | 转场回起居室 | 归家提示、夜归结算 |

### 2.2 街道天气与四时响应

街道场景动态响应全局四时时钟：
- **清晨 (0)**：晨光清冷微蓝，街灯熄灭，行人寥寥；
- **正午 (1)**：阳光铺洒石板路，长椅处光影斑驳；
- **傍晚 (2)**：夕阳余晖，街灯渐次点亮；
- **深夜 (3)**：灯火沉静，细雨微风，适宜返回卧室。

```lua
-- 监听时段变化并在街道做出响应
ModAPI.on_event("period_changed", function(new_period)
    if new_period == 2 then
        ModAPI.toast("傍晚已至，街道两旁的铸铁路灯依次泛起暖黄色光芒。")
    end
end)
```

---

## 3. 场景三：自定义秘密空间与物理房间门

在《度日》中，模组不仅可以修改原版场景，更能**凭空构建全新场景并打通实体物理门**。

### 3.1 动态生成物理实体木门 (`spawn_physical_door`)

通过继承 `DaydriftNativeMod`（Tier 3），创作者可以在原版街道或卧室的任意坐标处动态生成一扇带碰撞体积、交互提示气泡与转场逻辑的物理木门：

```gdscript
extends DaydriftNativeMod

func _on_scene_ready(scene_id: String, scene_root: Node) -> void:
    # 当街道场景就绪后，在 X=880, Y=420 处生成一扇通往地下阁楼的木门
    if scene_id == "street":
        var secret_door = spawn_physical_door(
            "street",                             # 挂载的目标场景
            Vector2(880, 420),                    # 木门在街道上的世界坐标
            "coffee_attic",                       # 传送目标地点 ID
            Vector2(160, 320),                    # 传送后玩家在目标场景的出生坐标
            "MOD_COFFEE_ATTIC_DOOR_PROMPT"        # 交互提示气泡多语言词条
        )
```

### 3.2 跨场景状态黑板同步

模组可在不同场景间自由传递与持久化状态数据：
- **临时状态**：`ModAPI.set_flag("visited_attic", true)`（随场景流转，游戏重启重置）；
- **持久状态**：`ModAPI.set_data("warmth_level", 100)`（永久保存在当前存档中）；
- **跨场景检测**：
  ```lua
  function on_scene_entered(scene_path)
      if string.find(scene_path, "coffee_attic") then
          ModAPI.toast("踩过吱呀作响的木楼梯，这里是一处隐秘的避风港。")
      end
  end
  ```

---

## 4. 完整工程参考

官方完整覆盖卧室、街道与秘密空间三场景的示范模组源码位于：
- `templates/example_rainy_coffee`（SDK 仓库）
- `mods/official/example_rainy_coffee`（Mod 商店仓库）
创作者可直接复制该工程作为新模组的开发起点！
