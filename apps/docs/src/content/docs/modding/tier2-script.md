---
title: Tier 2 双端脚本沙盒开发指南 (Script Pack)
description: 使用安全 Lua 沙盒开发《度日：Daydrift》动态机制、双端网络报文同步与自定义服务端指令
---

**Tier 2 双端脚本模组（Script Pack）** 适用于需要动态逻辑、复杂状态判定与双端联机互动的游戏机制。模组逻辑使用轻量优雅的 Lua 5.1 语言编写，分别在客户端（Godot 宿主）与服务端（Go 独立服务端）的安全沙盒虚拟机中受控运行。

---

## 1. 沙盒安全模型与执行边界

为了防止恶意脚本破坏系统或窃取玩家隐私，Tier 2 沙盒遵循极度严苛的零信任原则：

- **系统调用彻底阻断**：标准 Lua 库中的 `os`、`io`、`package`、`debug` 以及原始文件/网络 Socket 访问均被彻底剥离；
- **虚拟指令执行配额 (Instruction Quota)**：单次回调执行设置了严格的操作码上限，若发生死循环或耗时过长的运算，沙盒将自动熔断并抛出异常，绝不拖死游戏主线程；
- **独立上下文隔离**：每个模组拥有相互独立的全局环境表格（Environment Table），无法非法篡改其他模组或游戏内核的原生变量；
- **跨平台类型安全**：所有传入与传出参数均由宿主网关严格进行类型断言与数据格式校验。

---

## 2. 客户端脚本开发与 `ModAPI`

在客户端，脚本的入口默认为 `scripts/main.lua`。当模组加载就绪后，脚本可直接调用注入的全局门面对象 `ModAPI`。

### 2.1 基础叙事与分支交互

```lua
-- scripts/main.lua

-- 在屏幕顶部显示点阵通知气泡
ModAPI.toast("天气逐渐转凉，街灯已提前亮起。")

-- 弹出主角内心独白
ModAPI.say("秋风吹过窗棱，挂耳咖啡的香气在房间里渐渐散开。", "我")

-- 动态注入起居室烧水壶的互动选项
ModAPI.add_choice("kettle", "[模组] 冲泡深度烘焙曼特宁", "on_brew_coffee")

-- 交互回调函数
function on_brew_coffee()
    ModAPI.toast("正在烧水冲泡...")
    local current_day = ModAPI.get_day()
    local period = ModAPI.get_period_name()
    
    -- 弹出多分支选择框
    ModAPI.choice("我", "热气腾腾的咖啡已经萃取完毕，接下来要做什么？", {
        "在桌前静静品尝",
        "端到窗边看着街道"
    }, "on_coffee_action_chosen")
end

function on_coffee_action_chosen(choice_index, choice_text)
    if choice_index == 0 then
        ModAPI.toast("口感醇厚微苦，整个人清醒了许多。")
        -- 记录持久化数据到当前存档
        ModAPI.set_data("drank_coffee_today", true)
    else
        ModAPI.toast("街上偶尔有旅人走过，平静的一天。")
        -- 推进世界时段一个档位
        ModAPI.advance_time()
    end
end
```

### 2.2 状态黑板与生命周期监听

```lua
-- 监听游戏全局事件
ModAPI.on_event("period_changed", function(new_period)
    -- new_period: 0: 清晨, 1: 正午, 2: 傍晚, 3: 深夜
    if new_period == 3 then
        ModAPI.toast("深夜已至，该回床榻休息了。")
    end
end)

-- 读写全局场景黑板标记
local has_visited_cafe = ModAPI.get_flag("visited_cafe", false)
if not has_visited_cafe then
    ModAPI.set_flag("visited_cafe", true)
end
```

### 2.3 自定义双向网络报文通信

客户端可通过 `ModAPI.send_net_packet` 向联机房间发送自定义信道数据，并通过 `ModAPI.on_net_packet` 接收服务端广播：

```lua
-- 向联机房间发送点赞互动
function send_cheer_to_room()
    ModAPI.send_net_packet("coffee_cheer", {
        mood = "relaxed",
        note = "愿你在小镇度过宁静的一天"
    })
end

-- 监听来自服务端的模组自定义广播
ModAPI.on_net_packet("coffee_cheer", function(sender_id, payload)
    ModAPI.toast("同游旅人 [" .. sender_id .. "] 传来寄语: " .. payload.note)
end)
```

---

## 3. 服务端脚本开发与 `ServerAPI`

在独立服务端（Go 实现的 Headless Server）中，模组同样通过 Lua 沙盒承接核心联机逻辑。

### 3.1 核心服务对象与结构

在服务端脚本中，全局暴露了 `ServerAPI` 以及其子模块：
- `ServerAPI.log(message)`：向服务器终端与日志文件打印格式化信息；
- `ServerAPI.broadcast(message)`：向所有在线旅人的聊天频道发送系统公告；
- `ServerAPI.get_time()` / `ServerAPI.set_time(period, day)`：精确查询或重设世界时钟；
- `ServerAPI.Blackboard.get(key)` / `ServerAPI.Blackboard.set(key, val, broadcast)`：公共黑板同步；
- `ServerAPI.Net.send(peer_id, channel, payload)` / `broadcast(channel, payload)`：自定义网络信道通信；
- `ServerAPI.Commands.register(name, description, handler)`：注册控制台与聊天指令。

### 3.2 服务端实战脚本示例

```lua
-- scripts/server.lua

ServerAPI.log("雨天咖啡馆服务端模组已就绪。")

-- 注册玩家可用的聊天指令 (如在聊天框键入 /weather rain)
ServerAPI.Commands.register("weather", "查看或切换小镇天气状态", function(peer_id, args)
    if #args == 0 then
        local current = ServerAPI.Blackboard.get("weather") or "sunny"
        return "当前小镇天气为: " .. current
    end
    
    local new_weather = args[1]
    -- 写入公共黑板并同步给所有在线旅人
    ServerAPI.Blackboard.set("weather", new_weather, true)
    ServerAPI.broadcast("小镇上空的天气变更为: " .. new_weather)
    return "已成功切换天气为: " .. new_weather
end)

-- 全局回调：新旅人加入房间
function on_player_join(peer_id, nickname)
    ServerAPI.log("旅人 " .. nickname .. " (" .. peer_id .. ") 踏入了小镇。")
    ServerAPI.Net.send(peer_id, "welcome_pack", {
        motd = "欢迎来到《度日》的世界，请放慢脚步享受生活。",
        server_day = ServerAPI.get_time().day
    })
end

-- 全局回调：收到来自客户端的模组自定义报文
function on_net_packet(peer_id, channel, payload)
    if channel == "coffee_cheer" then
        ServerAPI.log("收到来自 " .. peer_id .. " 的寄语，正在全房间广播...")
        -- 广播转发给全体在线玩家
        ServerAPI.Net.broadcast("coffee_cheer", {
            sender = peer_id,
            mood = payload.mood,
            note = payload.note
        })
    end
end
```

---

## 4. 清单与权限声明

编写 Tier 2 模组时，若涉及自定义网络报文与公共状态修改，应在 `manifest.json` 中明确声明对应权限：

```json
{
  "$schema": "https://daydrift-docs.blym.top/schemas/manifest.schema.json",
  "id": "weather_sync_mod",
  "name": "微风气象与咖啡时光",
  "version": "1.0.0",
  "author": "晨曦创作者",
  "description": "实现客户端互动、服务端广播与全房间同步的动态天气模组。",
  "tier": 2,
  "type": "script",
  "entry": "scripts/main.lua",
  "net_sync_mode": "dual_sided",
  "permissions": [
    "network_mod_packet",
    "modify_blackboard"
  ]
}
```

关于全量函数签名与详细说明，请参考 [全量 API 字典速查](/modding/api/)。
