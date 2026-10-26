import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { ReleaseManifest, LatestManifest } from "@daydrift/content";
import { ReleaseManifestSchema, LatestManifestSchema } from "@daydrift/content";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function findDataFile(fileName: string): string | null {
  const candidates = [
    path.resolve(process.cwd(), "public/data", fileName),
    path.resolve(process.cwd(), "apps/official/public/data", fileName),
    path.resolve(__dirname, "../../public/data", fileName)
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

export function getReleaseManifest(): ReleaseManifest | null {
  try {
    const file = findDataFile("release.json");
    if (!file) return null;
    const raw = JSON.parse(fs.readFileSync(file, "utf-8"));
    const parsed = ReleaseManifestSchema.safeParse(raw);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function getLatestManifest(): LatestManifest | null {
  try {
    const file = findDataFile("latest.json");
    if (!file) return null;
    const raw = JSON.parse(fs.readFileSync(file, "utf-8"));
    const parsed = LatestManifestSchema.safeParse(raw);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
