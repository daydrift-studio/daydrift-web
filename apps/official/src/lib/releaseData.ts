import fs from "node:fs";
import path from "node:path";
import type { ReleaseManifest, LatestManifest } from "@daydrift/content";
import { ReleaseManifestSchema, LatestManifestSchema } from "@daydrift/content";

export function getReleaseManifest(): ReleaseManifest | null {
  try {
    const file = path.resolve(process.cwd(), "public/data/release.json");
    if (!fs.existsSync(file)) return null;
    const raw = JSON.parse(fs.readFileSync(file, "utf-8"));
    const parsed = ReleaseManifestSchema.safeParse(raw);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function getLatestManifest(): LatestManifest | null {
  try {
    const file = path.resolve(process.cwd(), "public/data/latest.json");
    if (!fs.existsSync(file)) return null;
    const raw = JSON.parse(fs.readFileSync(file, "utf-8"));
    const parsed = LatestManifestSchema.safeParse(raw);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
