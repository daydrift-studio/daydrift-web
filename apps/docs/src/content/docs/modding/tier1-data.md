---
title: Tier 1 纯数据切片开发指南 (Data Pack)
description: 零代码开发《度日：Daydrift》叙事切片、多语言剧本、自制音效与起居物件互动
---

**Tier 1 纯数据模组（Data Pack）** 是专为剧本创作者、文案同人与音效画师设计的轻量化创作体系。创作者无需编写任何程序代码，仅需通过规范的 JSON 切片与 CSV 多语言表格，即可为游戏无缝追加生动丰富的生活切片。

由于 Tier 1 模组不包含任何可执行代码脚本，其在物理层面上拥有零攻击面与零安全风险。

---

## 1. 模组目录结构

一个标准的 Tier 1 模组工程结构如下：

```text
my_story_pack/
├── manifest.json              # 模组核心元数据清单
├── preview.png                # 模组展示封面 (建议 1280x720)
├── narrative/                 # 叙事切片 JSON 目录
│   └── street_bench_slice.json
├── data/
│   └── i18n/
│       └── translations.csv   # 多语言对照表
└── assets/
    ├── audio/                 # 自定义音效与背景乐 (.ogg)
    │   └── turning_page.ogg
    └── textures/              # 贴图与图标 (.png / .webp)
        └── old_book_icon.png
```

---

## 2. 元数据清单配置 (`manifest.json`)

在模组根目录下创建 `manifest.json`，声明体系类型为 `"data"`（`tier: 1`）：

```json
{
  "$schema": "https://daydrift-docs.blym.top/schemas/manifest.schema.json",
  "id": "old_book_corner",
  "name": "旧书与长椅的闲适晨昏",
  "version": "1.0.0",
  "author": "林下行者",
  "description": "在街道长椅处新增翻阅旧诗集的日常互动与翻书白噪音。",
  "tier": 1,
  "type": "data",
  "net_sync_mode": "client_only"
}
```

---

## 3. 叙事切片数据规范 (`narrative/*.json`)

游戏内核通过切片驱动器（Slice Driver）合并所有激活模组的切片定义。每个切片文件可包含一个或多个与场景实体交互的触发规则：

```json
{
  "$schema": "https://daydrift-docs.blym.top/schemas/slice.schema.json",
  "slices": [
    {
      "slice_id": "read_old_poetry_at_bench",
      "target_object": "street_bench",
      "prompt_key": "MOD_OLD_BOOK_INTERACT_PROMPT",
      "conditions": {
        "min_day": 1,
        "max_day": 999,
        "allowed_periods": [0, 1, 2],
        "flags_required": {}
      },
      "actions": [
        {
          "type": "play_sound",
          "sound_path": "assets/audio/turning_page.ogg",
          "volume_db": -2.0
        },
        {
          "type": "say",
          "speaker": "MOD_SPEAKER_ME",
          "text": "MOD_OLD_BOOK_LINE_1"
        },
        {
          "type": "choice",
          "prompt": "MOD_OLD_BOOK_CHOICE_PROMPT",
          "options": [
            {
              "id": "keep_reading",
              "text": "MOD_OLD_BOOK_CHOICE_1",
              "actions": [
                {
                  "type": "say",
                  "speaker": "MOD_SPEAKER_ME",
                  "text": "MOD_OLD_BOOK_LINE_2"
                },
                {
                  "type": "set_flag",
                  "key": "read_poetry_today",
                  "value": true
                },
                {
                  "type": "toast",
                  "message": "MOD_OLD_BOOK_TOAST_PEACE"
                }
              ]
            },
            {
              "id": "close_book",
              "text": "MOD_OLD_BOOK_CHOICE_2",
              "actions": [
                {
                  "type": "say",
                  "speaker": "MOD_SPEAKER_ME",
                  "text": "MOD_OLD_BOOK_LINE_3"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

### 字段说明
- `target_object`：绑定的交互实体 ID。游戏原生实体包含：
  - `bed`：卧室床榻
  - `kettle`：起居室烧水壶
  - `desk`：书桌笔记
  - `bedroom_window`：卧室落地窗
  - `street_bench`：街道复古长椅
  - `street_lamp`：街道铸铁街灯
- `conditions`：生效约束。
  - `allowed_periods`：生效的时段数组（`0`: 清晨, `1`: 正午, `2`: 傍晚, `3`: 深夜）；
  - `flags_required`：必须满足的状态黑板键值。
- `actions`：顺序执行的动作列表，支持 `say`（对话）、`choice`（分支选择）、`play_sound`（播放音频）、`set_flag`（设置标记）、`toast`（悬浮气泡通知）。

---

## 4. 多语言翻译对照表 (`data/i18n/translations.csv`)

为了支持全球玩家与无障碍多语言切换，切片中的所有显示文本均推荐采用词条键（Key）替代硬编码文字：

```csv
id,zh_CN,en_US,ja_JP
MOD_SPEAKER_ME,"我","Me","私"
MOD_OLD_BOOK_INTERACT_PROMPT,"[模组] 翻阅旧诗集","[Mod] Read Old Poetry","[Mod] 古い詩集を読む"
MOD_OLD_BOOK_CHOICE_PROMPT,"纸页间散落着一片微黄的银杏叶：","A dried ginkgo leaf slips between the pages:","ページの間から色褪せた銀杏の葉がこぼれ落ちる："
MOD_OLD_BOOK_CHOICE_1,"静心读完这一章","Read through this chapter quietly","この章を静かに読み終える"
MOD_OLD_BOOK_CHOICE_2,"合上诗集，注视街景","Close the book and watch the street","詩集を閉じ、街の景色を見つめる"
MOD_OLD_BOOK_LINE_1,"封面上的烫金字迹已经模糊，泛着陈旧而温润的草木气味。","The gilded title has faded, carrying a gentle scent of old paper.","擦れた金文字が、古びた温かな草木の香りを漂わせている。"
MOD_OLD_BOOK_LINE_2,"字里行间的句子短促而舒缓，风吹过街角，时光似乎慢了下来。","The gentle verses flow like a quiet breeze through the street corner.","言葉の間に流れる静けさが、街角の風と共に時間を和らげていく。"
MOD_OLD_BOOK_LINE_3,"将银杏叶夹回书脊，街灯的暖黄色逐渐沉淀。","Tucking the leaf back in, the warm yellow lamplight settles gently.","銀杏の葉を挟み直すと、街灯の暖かな光が静かに染み渡る。"
MOD_OLD_BOOK_TOAST_PEACE,"心灵感到宁静，心情获得了放松。","You feel calm and deeply refreshed.","心が穏やかになり、安らぎに包まれた。"
```

---

## 5. 媒体素材准备规范

- **音频格式**：推荐使用标准 `.ogg` Vorbis 格式，采样率 44.1kHz 或 48kHz，单声道或立体声，比特率建议 96~128kbps 以控制体积；
- **贴图格式**：采用标准 `.png` 或无损 `.webp` 格式，保持像素画原汁原味的点阵边缘，避免压缩模糊。

---

## 6. 测试与打包

使用 `ddmod_cli.py` 一键建立调试软链接或完成打包发布：

```bash
# 本地热链接调试
python sdk/ddmod_cli.py dev-link my_story_pack

# 静态格式审计
python sdk/ddmod_cli.py validate my_story_pack

# 打包发布为 .ddmod 文件
python sdk/ddmod_cli.py pack my_story_pack
```
