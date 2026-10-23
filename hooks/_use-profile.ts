import { ApiError, profileApi } from "@/services";
import { SESSION_EXPIRED } from "@/utils";
import { useCallback } from "react";
import { useFocusFetch } from "./_use-focus-fetch";
import { useFocusPages } from "./_use-focus-pages";

const isStatus = (error: unknown, status: number) =>
  error instanceof ApiError && error.status === status;

const describeProfileError = (error: unknown) =>
  isStatus(error, 401) ? SESSION_EXPIRED : "Não foi possível carregar seu perfil.";

const describeOtherProfileError = (error: unknown) => {
  if (isStatus(error, 401)) return SESSION_EXPIRED;
  if (isStatus(error, 404)) return "Perfil não encontrado.";
  return "Não foi possível carregar este perfil.";
};

const describeStatsError = () => "Não foi possível carregar suas estatísticas.";
const describeOtherStatsError = () => "Não foi possível carregar as estatísticas.";

/**
 * Cartão de perfil, recarregado a cada foco porque nome, bio e foto mudam em
 * outra aba. Sem `username`, do usuário logado.
 */
export const useProfile = (username?: string) => {
  const fetchProfile = useCallback(
    async (token: string) => (await profileApi.card(token, username)).profile,
    [username],
  );
  return useFocusFetch(
    fetchProfile,
    username ? describeOtherProfileError : describeProfileError,
    SESSION_EXPIRED,
  );
};

/**
 * Estatísticas por plataforma, recarregadas a cada foco porque a sincronização
 * muda os números. Sem `username`, do usuário logado.
 */
export const useProfileStats = (username?: string) => {
  const fetchStats = useCallback(
    (token: string) => profileApi.stats(token, username),
    [username],
  );
  return useFocusFetch(fetchStats, username ? describeOtherStatsError : describeStatsError);
};

const describeGamesError = () => "Não foi possível carregar seus jogos.";
const describeOtherGamesError = () => "Não foi possível carregar os jogos.";

/**
 * Todos os jogos do perfil, do jogado mais recente ao mais antigo, carregados
 * aos poucos com `useFocusPages`. Sem `username`, do usuário logado.
 */
export const useProfileGames = (username?: string) => {
  const fetchPage = useCallback(
    async (token: string, offset: number) => {
      const page = await profileApi.games(token, offset, username);
      return { items: page.games, next_offset: page.next_offset };
    },
    [username],
  );
  return useFocusPages(fetchPage, username ? describeOtherGamesError : describeGamesError);
};
