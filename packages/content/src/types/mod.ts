export type ModType = "data" | "script" | "hybrid";
export type ModNetSyncMode = "client_only" | "server_only" | "full_sync";
export type ModOrigin = "official" | "community" | "beta";
export type ModChannel = "release" | "beta";
export type ModValidationStatus = "verified" | "beta" | "unsigned" | "invalid";

export interface ModManifest {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  type: ModType;
  priority?: number;
  net_sync_mode?: ModNetSyncMode;
  preview?: string;
  permissions?: string[];
  compatibility?: {
    minVersionCode: number;
    maxVersionCode: number | null;
  };
  license?: string;
  source?: string;
  homepage?: string;
  tags?: string[];
}

export interface ModIndexItem {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  origin: ModOrigin;
  channel: ModChannel;
  path: string;
  digest: string;
  keyId: string;
  signedAt: string;
  preview?: string;
  permissions?: string[];
  type: ModType;
  netSyncMode?: ModNetSyncMode;
  compatibility?: {
    minVersionCode: number;
    maxVersionCode: number | null;
  };
  size: number;
  download: string;
  sha256: string;
  source?: string;
  sourceCommit?: string;
  owners?: string[];
  license?: string;
}

export interface ModCatalogItem extends Omit<ModIndexItem, "download" | "preview" | "path"> {
  downloadUrl: string;
  previewUrl?: string;
}

export interface ModCatalog {
  format: "daydrift-mod-catalog";
  version: number;
  generatedAt: string;
  site: string;
  mods: ModCatalogItem[];
}
