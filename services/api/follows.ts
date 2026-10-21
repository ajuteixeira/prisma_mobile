import { request } from "./_client";
import type { FollowCounts, FollowPage } from "./types";

/** Listas paginadas: quem segue, quem é seguido e a busca por username. */
export type FollowList = "followers" | "following" | "search";

export const followsApi = {
  /** Contagens de seguidores e seguidos do usuário logado. */
  counts: (token: string) => request<FollowCounts>("/api/follows", { token }),

  /**
   * Uma página da lista. Seguidores e Seguindo vêm dos mais recentes; a busca
   * vem em ordem alfabética pelo nome e, com `query` vazia, lista todo mundo.
   */
  page: (token: string, list: FollowList, offset: number, query = "") => {
    const params = new URLSearchParams({ offset: String(offset) });
    if (list === "search") params.set("q", query);
    return request<FollowPage>(`/api/follows/${list}?${params}`, { token });
  },

  follow: (token: string, profileId: number) =>
    request<null>(`/api/follows/${profileId}`, { token, method: "PUT" }),

  unfollow: (token: string, profileId: number) =>
    request<null>(`/api/follows/${profileId}`, { token, method: "DELETE" }),
};
