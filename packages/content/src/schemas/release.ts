import { z } from "zod";

export const Sha256Schema = z.string().regex(/^sha256:[a-f0-9]{64}$/, "Must be sha256:<64 hex>");

export const AssetSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(["client", "server"]),
  platform: z.enum(["windows", "linux", "macos", "android"]),
  arch: z.enum(["x86_64", "arm64", "x86", "arm32", "universal", "bundle"]),
  file: z.string().min(1),
  size: z.number().int().positive(),
  sha256: Sha256Schema,
  url: z.string().url(),
});

export const ReleaseManifestSchema = z.object({
  schema: z.literal("daydrift-release/1"),
  repo: z.string().min(1),
  tag: z.string().regex(/^v\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?$/, "Must be v<semver>"),
  version: z.string().min(1),
  versionCode: z.number().int().positive(),
  channel: z.enum(["stable", "rc", "beta", "alpha"]),
  publishedAt: z.string().datetime(),
  title: z.record(z.string()),
  notes: z.record(z.string()),
  requirements: z.record(z.string()).optional(),
  assets: z.array(AssetSchema).min(1),
  serverAssets: z.array(AssetSchema).optional(),
});

export const LatestManifestSchema = z.object({
  schema: z.literal("daydrift-latest/1"),
  repo: z.string().min(1),
  tag: z.string().min(1),
  version: z.string().min(1),
  versionCode: z.number().int().positive(),
  channel: z.enum(["stable", "rc", "beta", "alpha"]),
  publishedAt: z.string().datetime(),
  releaseDigest: Sha256Schema,
  notes: z.record(z.string()),
  assets: z.array(AssetSchema).min(1),
});

export const ReleaseSignatureSchema = z.object({
  format: z.literal("daydrift-release-signature"),
  version: z.literal(1),
  repo: z.string().min(1),
  tag: z.string().min(1),
  file: z.string().min(1),
  digest: Sha256Schema,
  keyId: z.string().min(1),
  signedAt: z.string().datetime(),
  signature: z.string().min(64),
});
