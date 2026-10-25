# ADR 0003: Mod 安全签名规范与审计模型

- **状态**: Accepted (已通过)
- **日期**: 2026-10-25
- **决策人**: 白鹿原嚒 / Daydrift Studio

---

## 背景与问题

《度日：Daydrift》提供开放的模组扩展生态，支持数据配置与 Tier 2 Lua 脚本。
若允许第三方模组随意传播，存在供应链篡改、恶意脚本注入或伪造官方模组的风险。需要一套透明、可审计、全静态且支持离线验证的签名机制。

参考实现：`chthollyphile/folium-compound` 的签名架构。
原则：仅参考其协议流程与哈希签名设计，按洁净室原则独立实现，不复制任何受版权保护的业务代码。

---

## 决策内容

### 1. 签名规范 (`daydrift.sig.json`)

每个经过官方审查认证的模组，在其根目录下必须包含 `daydrift.sig.json`：

- **签名算法**：Ed25519（公钥 32 字节，签名 64 字节，Base64 编码）。
- **文件摘要覆盖**：递归计算模组目录内全部文件（排除 `daydrift.sig.json` 本身）的 SHA-256，键按 **UTF-8 字节序升序排序**。
- **签名消息规范**：
  ```text
  daydrift-mod-signature/1
  id={mod_id}
  version={semver}
  channel={release|beta}
  digest=sha256:{root_digest_hex}
  keyId={key_id}
  signedAt={RFC3339 UTC}
  
  ```

### 2. 渠道与密钥隔离

- **`official` / `community`（正式渠道）**：使用发布私钥由 GitHub Actions 审核通过后签名；
- **`beta`（先行测试渠道）**：使用专用测试密钥签名，Mod 商店明确打上“先行测试”警示标；
- 渠道错误（如将 beta 模组用正式密钥签名，或反之）直接视为 `wrong-channel`，CI 拦截构建。

### 3. 确定性 ZIP 打包 (Deterministic ZIP)

为保证下载的 ZIP 包哈希（`sha256`）在任何机器上均可重现：
- 文件修改时间固定为：`2026-01-01 00:00:00 UTC`；
- 文件与目录权限固定为：文件 `0644`，目录 `0755`；
- 压缩包内条目严格按字典序排序；
- 消除任何系统宿主元数据与扩展字段。

### 4. 吊销与撤回模型

- **密钥吊销**：在 `keys/trusted-keys.json` 中标记密钥状态（`active` / `revoked` / `expired`）；
- **模组撤回**：在 `keys/revoked-mods.json` 中记录被撤回模组的**签名摘要 (`digest`)**，而非仅凭文件名或 ID。被撤回的模组在构建和客户端中直接判定为 `revoked`，商店下架并不允许下载。

### 5. 商店四态安全展示

Mod 商店在展示时严格区分四种状态：
1. **`verified`（已验证）**：签名有效、公钥可信、渠道匹配；
2. **`beta`（先行测试）**：测试密钥签名有效，提示可能存在兼容性问题；
3. **`unsigned`（未验证）**：第三方未签名模组，提示玩家谨慎下载；
4. **`invalid`（无效或篡改）**：哈希不匹配、密钥被吊销或渠道错误，**严格禁止提供下载按钮**，仅保留举报通道。

### 6. 客户端校验方案 (Phase 9 Spike)

- 针对 Godot 4.7 的 `Crypto` / `CryptoKey` 原生是否支持 Ed25519 验证进行实测；
- 若支持则直接调用；若不支持，采用极轻量 GDExtension (libsodium / monocypher) 动态链接库进行安全验签，保证与 Web 端算法绝对一致，严禁静默降级为无校验。
