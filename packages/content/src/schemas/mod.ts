import { z } from "zod";
import { Sha256Schema } from "./release";

export const ModPermissionEnum = z.enum([
  "narrative.say",
  "narrative.choice",
  "interaction.inject",
  "ui.toast",
  "world.time",
  "world.flag",
  "storage.mod",
  "asset.texture",
  "asset.audio"
]);

export const ModManifestSchema = z.object({
  id: z.string().regex(/^[a-z0-9][a-z0-9_-]{0,63}$/),
  name: z.string().min(1).max(64),
  version: z.string().regex(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/),
  author: z.string().min(1).max(64),
  description: z.string().max(512),
  type: z.enum(["data", "script", "hybrid"]),
  priority: z.number().int().optional().default(10),
  net_sync_mode: z.enum(["client_only", "server_only", "full_sync"]).optional().default("client_only"),
  preview: z.string().regex(/^[^/\\].*\.(png|jpg|jpeg|webp)$/).optional(),
  permissions: z.array(ModPermissionEnum).optional(),
  compatibility: z.object({
    minVersionCode: z.number().int().min(0),
    maxVersionCode: z.number().int().nullable().optional()
  }).optional(),
  license: z.string().optional(),
  source: z.string().url().optional(),
  homepage: z.string().url().optional(),
  tags: z.array(z.string().max(20)).max(10).optional()
});

export const ModSignatureSchema = z.object({
  format: z.literal("daydrift-mod-signature"),
  version: z.literal(1),
  id: z.string().min(1),
  versionNumber: z.string().min(1),
  channel: z.enum(["release", "beta"]),
  digest: Sha256Schema,
  keyId: z.string().min(1),
  signedAt: z.string().datetime(),
  signature: z.string().min(64)
});
