import type { PlatformSlug } from "@/constants";
import { request } from "./_client";
import type { SyncStatus } from "./types";

type Raw = Record<string, unknown>;

const count = (value: unknown) => (typeof value === "number" && Number.isFinite(value) ? value : 0);
const text = (value: unknown) => (typeof value === "string" && value ? value : null);

/**
 * Converte a resposta em `SyncStatus`. Campos ausentes ou de outro tipo viram
 * `0`, `null` ou `false`. Plataformas sem slug são descartadas.
 */
const toSyncStatus = (raw: unknown): SyncStatus => {
  const sync = (raw ?? {}) as Raw;
  const current = (sync.current ?? null) as Raw | null;
  const platforms = Array.isArray(sync.platforms) ? (sync.platforms as Raw[]) : [];

  return {
    running: sync.running === true,
    started_at: text(sync.started_at),
    finished_at: text(sync.finished_at),
    accounts_total: count(sync.accounts_total),
    accounts_done: count(sync.accounts_done),
    accounts_failed: count(sync.accounts_failed),
    games_synced: count(sync.games_synced),
    achievements_synced: count(sync.achievements_synced),
    current:
      current && text(current.platform)
        ? {
            platform: current.platform as PlatformSlug,
            games_done: count(current.games_done),
            games_total: typeof current.games_total === "number" ? current.games_total : null,
          }
        : null,
    platforms: platforms
      .filter((item) => text(item?.platform))
      .map((item) => ({
        platform: item.platform as PlatformSlug,
        sync_status: text(item.sync_status) ?? "idle",
      })),
  };
};

export const syncApi = {
  /** `GET /api/sync`: estado atual da sincronização. */
  status: async (token: string) =>
    toSyncStatus((await request<{ sync?: unknown }>("/api/sync", { token }))?.sync),

  /**
   * `POST /api/sync`: inicia a sincronização das contas pendentes. `started` é
   * `false` quando já havia uma em andamento ou nenhuma conta pendente.
   */
  start: async (token: string) => {
    const data = await request<{ started?: unknown; sync?: unknown }>("/api/sync", {
      token,
      method: "POST",
    });
    return { started: data?.started === true, sync: toSyncStatus(data?.sync) };
  },
};
