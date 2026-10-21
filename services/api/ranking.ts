import { request } from "./_client";
import type { RankingEntry } from "./types";

export const rankingApi = {
  /** Ranking entre o usuário logado e quem ele segue, por total de conquistas. */
  list: async (token: string) =>
    (await request<{ ranking: RankingEntry[] }>("/api/ranking", { token }))
      .ranking ?? [],
};
