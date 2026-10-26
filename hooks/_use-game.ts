import { ApiError, profileApi, type GameAchievementFilter } from "@/services";
import { SESSION_EXPIRED } from "@/utils";
import { useCallback } from "react";
import { useFocusFetch } from "./_use-focus-fetch";
import { useFocusPages } from "./_use-focus-pages";

const describeGameError = (error: unknown) => {
  if (error instanceof ApiError && error.status === 401) return SESSION_EXPIRED;
  if (error instanceof ApiError && error.status === 404) return "Jogo não encontrado.";
  return "Não foi possível carregar o jogo.";
};

const describeAchievementsError = () => "Não foi possível carregar as conquistas.";

/**
 * Um jogo do perfil para a tela de detalhes, recarregado a cada foco e a cada
 * avanço da sincronização. Sem `username`, do usuário logado.
 */
export const useProfileGame = (id: number, username?: string) => {
  const fetchGame = useCallback(
    (token: string) => profileApi.game(token, id, username),
    [id, username],
  );
  return useFocusFetch(fetchGame, describeGameError, SESSION_EXPIRED);
};

/**
 * Conquistas do jogo carregadas aos poucos; trocar o filtro recomeça a lista do
 * zero. Sem `username`, do usuário logado.
 */
export const useGameAchievements = (
  id: number,
  filter: GameAchievementFilter,
  username?: string,
) => {
  const fetchPage = useCallback(
    async (token: string, offset: number) => {
      const page = await profileApi.gameAchievements(token, id, filter, offset, username);
      return { items: page.achievements, next_offset: page.next_offset };
    },
    [filter, id, username],
  );
  return useFocusPages(fetchPage, describeAchievementsError);
};
