import type { PlatformSlug } from "@/constants";

/** Conta em sincronização. `games_total` é `null` até a plataforma retornar a lista de jogos. */
export type SyncCurrent = {
  platform: PlatformSlug;
  games_done: number;
  games_total: number | null;
};

/** Resposta de `GET` e `POST /api/sync`. */
export type SyncStatus = {
  running: boolean;
  started_at: string | null;
  finished_at: string | null;
  /** Contas da execução atual ou da última, incluindo as vinculadas durante ela. */
  accounts_total: number;
  accounts_done: number;
  accounts_failed: number;
  games_synced: number;
  achievements_synced: number;
  current: SyncCurrent | null;
  /** Status salvo de cada conta: `idle`, `running`, `completed` ou `failed`. */
  platforms: { platform: PlatformSlug; sync_status: string }[];
};
