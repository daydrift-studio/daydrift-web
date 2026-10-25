import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatBytes, formatSha256, getPlatformLabel, getChannelBadge } from "../src/formatters/index";

describe("Formatters", () => {
  it("formats bytes accurately", () => {
    assert.equal(formatBytes(0), "0 B");
    assert.equal(formatBytes(1024), "1 KiB");
    assert.equal(formatBytes(1048576), "1 MiB");
    assert.equal(formatBytes(12345678), "11.77 MiB");
  });

  it("formats sha256 with ellipsis", () => {
    const hash = "sha256:11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff";
    assert.equal(formatSha256(hash), "11223344...ccddeeff");
  });

  it("maps platform and architecture", () => {
    assert.equal(getPlatformLabel("windows", "x86_64"), "Windows (64-bit)");
    assert.equal(getPlatformLabel("android", "arm64"), "Android (ARM64)");
    assert.equal(getPlatformLabel("macos", "universal"), "macOS (Universal)");
  });

  it("determines channel badge label and color", () => {
    assert.equal(getChannelBadge("stable").color, "emerald");
    assert.equal(getChannelBadge("alpha").color, "purple");
  });
});
