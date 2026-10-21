import { request } from "./_client";
import type { FollowProfile, Follows } from "./types";

export const followsApi = {
  /** Seguidores e seguidos do usuário logado. */
  list: (token: string) => request<Follows>("/api/follows", { token }),

  /** Perfis cujo username contém `query`, sem o próprio usuário. */
  search: async (token: string, query: string) =>
    (
      await request<{ results: FollowProfile[] }>(
        `/api/follows/search?q=${encodeURIComponent(query)}`,
        { token },
      )
    ).results ?? [],

  follow: (token: string, profileId: number) =>
    request<null>(`/api/follows/${profileId}`, { token, method: "PUT" }),

  unfollow: (token: string, profileId: number) =>
    request<null>(`/api/follows/${profileId}`, { token, method: "DELETE" }),
};
