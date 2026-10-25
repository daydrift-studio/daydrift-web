export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes <= 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KiB", "MiB", "GiB", "TiB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const val = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));
  return `${val} ${sizes[i] ?? "B"}`;
}

export function formatDate(isoDate: string, locale: "zh-CN" | "en" = "zh-CN"): string {
  try {
    const d = new Date(isoDate);
    if (isNaN(d.getTime())) return isoDate;
    if (locale === "zh-CN") {
      return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
    }
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return isoDate;
  }
}

export function formatSha256(shaWithPrefix: string): string {
  if (!shaWithPrefix.startsWith("sha256:")) return shaWithPrefix;
  const hex = shaWithPrefix.slice(7);
  return `${hex.slice(0, 8)}...${hex.slice(-8)}`;
}

export function getPlatformLabel(platform: string, arch: string): string {
  const pMap: Record<string, string> = {
    windows: "Windows",
    linux: "Linux",
    macos: "macOS",
    android: "Android"
  };
  const aMap: Record<string, string> = {
    x86_64: "64-bit",
    arm64: "ARM64",
    x86: "32-bit",
    arm32: "ARM32",
    universal: "Universal",
    bundle: "App Bundle"
  };
  const pName = pMap[platform] ?? platform;
  const aName = aMap[arch] ?? arch;
  return `${pName} (${aName})`;
}

export function getChannelBadge(channel: string): { label: string; color: string } {
  switch (channel) {
    case "stable":
      return { label: "正式稳定版", color: "emerald" };
    case "rc":
      return { label: "发行候选 (RC)", color: "blue" };
    case "beta":
      return { label: "测试先行版 (Beta)", color: "amber" };
    case "alpha":
      return { label: "早期开发版 (Alpha)", color: "purple" };
    default:
      return { label: channel, color: "zinc" };
  }
}
