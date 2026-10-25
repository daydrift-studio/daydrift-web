export type Channel = "stable" | "rc" | "beta" | "alpha";

export interface Asset {
  id: string;
  kind: "client" | "server";
  platform: "windows" | "linux" | "macos" | "android";
  arch: "x86_64" | "arm64" | "x86" | "arm32" | "universal" | "bundle";
  file: string;
  size: number;
  sha256: string;
  url: string;
}

export interface ReleaseManifest {
  schema: string;
  repo: string;
  tag: string;
  version: string;
  versionCode: number;
  channel: Channel;
  publishedAt: string;
  title: Record<string, string>;
  notes: Record<string, string>;
  requirements?: Record<string, string>;
  assets: Asset[];
  serverAssets?: Asset[];
}

export interface LatestManifest {
  schema: string;
  repo: string;
  tag: string;
  version: string;
  versionCode: number;
  channel: Channel;
  publishedAt: string;
  releaseDigest: string;
  notes: Record<string, string>;
  assets: Asset[];
}

export interface ReleaseSignature {
  format: "daydrift-release-signature";
  version: number;
  repo: string;
  tag: string;
  file: string;
  digest: string;
  keyId: string;
  signedAt: string;
  signature: string;
}
