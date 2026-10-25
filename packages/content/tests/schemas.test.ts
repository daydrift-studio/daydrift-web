import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ReleaseManifestSchema, LatestManifestSchema } from "../src/schemas/release";
import { ModManifestSchema } from "../src/schemas/mod";

describe("Schemas", () => {
  it("validates a standard release manifest", () => {
    const fixture = {
      schema: "daydrift-release/1",
      repo: "daydrift-studio/daydrift",
      tag: "v0.2.1-alpha",
      version: "0.2.1-alpha",
      versionCode: 4,
      channel: "alpha",
      publishedAt: "2026-10-25T12:00:00Z",
      title: { "zh-CN": "联机漫游测试" },
      notes: { "zh-CN": "更新说明..." },
      assets: [
        {
          id: "win-x64",
          kind: "client",
          platform: "windows",
          arch: "x86_64",
          file: "Daydrift_v0.2.1-alpha_win_x64.exe",
          size: 1048576,
          sha256: "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          url: "https://github.com/daydrift-studio/daydrift/releases/download/v0.2.1-alpha/Daydrift_v0.2.1-alpha_win_x64.exe"
        }
      ]
    };

    const parsed = ReleaseManifestSchema.safeParse(fixture);
    assert.equal(parsed.success, true);
  });

  it("rejects invalid mod manifest ID with uppercase or symbols", () => {
    const invalidMod = {
      id: "Bad_Mod!ID",
      name: "Bad Mod",
      version: "1.0.0",
      author: "Test",
      description: "Test",
      type: "data"
    };

    const parsed = ModManifestSchema.safeParse(invalidMod);
    assert.equal(parsed.success, false);
  });

  it("accepts valid mod manifest", () => {
    const validMod = {
      id: "example_rainy_coffee",
      name: "手冲挂耳咖啡",
      version: "1.0.0",
      author: "Daydrift Team",
      description: "在卧室水壶处增加冲泡热咖啡的生活互动选项。",
      type: "data",
      priority: 10,
      net_sync_mode: "client_only",
      permissions: ["narrative.choice", "world.flag"]
    };

    const parsed = ModManifestSchema.safeParse(validMod);
    assert.equal(parsed.success, true);
  });
});
