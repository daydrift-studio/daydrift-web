import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const REPO = process.env.RELEASES_REPO || "daydrift-studio/daydrift";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const DATA_DIR = path.resolve("apps/official/public/data");

async function fetchJson(url) {
  const headers = {
    "User-Agent": "daydrift-sync-releases"
  };
  if (GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${GITHUB_TOKEN}`;
  }
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} fetching ${url}`);
  }
  return res.json();
}

async function fetchText(url) {
  const headers = {
    "User-Agent": "daydrift-sync-releases"
  };
  if (GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${GITHUB_TOKEN}`;
  }
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} fetching ${url}`);
  }
  return res.text();
}

async function main() {
  console.log(`[INFO] Syncing releases from ${REPO}...`);
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  let releases;
  try {
    releases = await fetchJson(`https://api.github.com/repos/${REPO}/releases?per_page=100`);
  } catch (err) {
    console.warn(`[WARN] Could not fetch releases from GitHub API: ${err.message}. Retaining local snapshot.`);
    return;
  }

  const validReleases = releases.filter((r) => !r.draft);
  if (validReleases.length === 0) {
    console.log("[INFO] No published releases found on remote.");
    return;
  }

  const latestRelease = validReleases[0];
  console.log(`[INFO] Latest release tag: ${latestRelease.tag_name}`);

  // Download key assets if present
  const assetNames = ["release.json", "release.json.sig", "latest.json", "latest.json.sig", "SHA256SUMS"];
  for (const name of assetNames) {
    const asset = latestRelease.assets?.find((a) => a.name === name);
    if (asset) {
      console.log(`[INFO] Downloading ${name}...`);
      const text = await fetchText(asset.browser_download_url);
      fs.writeFileSync(path.join(DATA_DIR, name), text, "utf-8");
    }
  }

  console.log("[OK] Successfully synced release snapshot.");
}

main().catch((err) => {
  console.error("[ERROR] Sync failed:", err);
  process.exit(1);
});
