# ADR 0002: Release 发布数据契约与资产命名规范

- **状态**: Accepted (已通过)
- **日期**: 2026-10-25
- **决策人**: 白鹿原嚒 / Daydrift Studio

---

## 背景与问题

《度日：Daydrift》需要面向 Windows (x64 / arm64)、Linux、macOS、Android 以及独立服务端多达 16 个不同架构的目标产物进行自动化发布分发。
此前版本号存在两处定义（`version.json` 与 `update_checker.gd`），且缺乏防篡改签名与强类型数据契约，给自动化分发和客户端安全升级带来隐患。

---

## 决策内容

### 1. 资产命名规范（严格对齐 `tools/export_builds.py`）

所有构建包遵循统一命名格式：

- **桌面客户端**：
  - Windows: `Daydrift_v{version}_win_x64.exe`, `Daydrift_v{version}_win_arm64.exe`, `Daydrift_v{version}_win_x86.exe`
  - Linux: `Daydrift_v{version}_linux_x64.x86_64`, `Daydrift_v{version}_linux_arm64.arm64`
  - macOS: `Daydrift_v{version}_macos_universal.zip`
- **移动端**：
  - Android: `Daydrift_v{version}_android_arm64.apk`, `Daydrift_v{version}_android_arm32.apk`, `Daydrift_v{version}_android_universal.apk`, `Daydrift_v{version}_android_bundle.aab`
- **独立服务端**：
  - `Daydrift_Server_v{version}_linux_x64.zip`, `Daydrift_Server_v{version}_linux_arm64.zip`
  - `Daydrift_Server_v{version}_windows_x64.zip`, `Daydrift_Server_v{version}_windows_arm64.zip`
  - `Daydrift_Server_v{version}_macos_universal.zip`

### 2. 发布清单与数据契约

每次发布必须生成两份核心清单并附带数字签名：

1. **全量发布清单 `release.json`**：
   - 包含完整的 11 个客户端与 5 个服务端资产元数据（文件大小、SHA-256、公开下载 URL）；
   - 包含中英双语的面向玩家更新日志（`notes`）；
   - 包含运行环境最低配置要求。
2. **客户端轻量更新清单 `latest.json`**：
   - 提取最新版本核心信息，供游戏内 `update_checker.gd` 静默轮询；
   - 客户端升级判定**严格基于整数 `versionCode`**，只增不减，不使用字符串比较；
   - 客户端**仅展示更新日志与跳转官网下载，严禁自动静默替换与执行外部二进制代码**。

### 3. Ed25519 签名与校验

- 签名算法：**Ed25519**；
- 签名消息固定六行规范，换行符统一为 LF（`\n`），末尾保留空行：
  ```text
  daydrift-release-signature/1
  repo=daydrift-studio/daydrift
  tag=v{version}
  file=release.json
  digest=sha256:{hex}
  keyId=daydrift-release-2026-1
  signedAt={RFC3339 UTC}
  
  ```
- 签名文件分别保存为 `release.json.sig` 与 `latest.json.sig`。

### 4. 发布不可变性 (Release Immutability)

- GitHub Release 资产一经发布不可覆盖重写；
- 若发布存在严重瑕疵，必须提升补丁版本号（如 `0.2.2-alpha`）重新打包发布，旧资产通过撤回摘要（revocation）标记，保障客户端供应链可审计。
