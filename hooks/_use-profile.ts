import { ApiError, profileApi, type ProfileGame } from "@/services";
import { useSession } from "@/store";
import { describeApiError, SESSION_EXPIRED } from "@/utils";
import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { useFocusFetch } from "./_use-focus-fetch";
import { useReloadOnSync } from "./_use-reload-on-sync";

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
 * aos poucos: recomeça da primeira página a cada foco e a cada avanço da
 * sincronização, e `loadMore` traz a próxima. Respostas de um recomeço anterior
 * são descartadas. Sem `username`, do usuário logado.
 */
export const useProfileGames = (username?: string) => {
  const token = useSession((state) => state.token);
  const [items, setItems] = useState<ProfileGame[] | null>(null);
  const [loading, setLoading] = useState(Boolean(token));
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nextOffset = useRef<number | null>(null);
  const failedOffset = useRef<number | null>(null);
  const generation = useRef(0);
  const busy = useRef(false);

  const fetchPage = useCallback(
    async (offset: number) => {
      if (!token) return;
      const current = generation.current;
      busy.current = true;
      failedOffset.current = null;
      try {
        const page = await profileApi.games(token, offset, username);
        if (current !== generation.current) return;
        nextOffset.current = page.next_offset;
        setItems((previous) =>
          offset === 0 ? page.games : [...(previous ?? []), ...page.games],
        );
        setError(null);
      } catch (pageError) {
        if (current !== generation.current) return;
        failedOffset.current = offset;
        if (offset > 0) setError(describeApiError(pageError));
        else setError((username ? describeOtherGamesError : describeGamesError)());
      } finally {
        if (current === generation.current) {
          busy.current = false;
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [token, username],
  );

  const reset = useCallback(() => {
    generation.current += 1;
    nextOffset.current = null;
    setLoading(Boolean(token));
    setLoadingMore(false);
    return fetchPage(0);
  }, [fetchPage, token]);

  const loadMore = useCallback(() => {
    if (busy.current || nextOffset.current === null) return;
    setLoadingMore(true);
    fetchPage(nextOffset.current);
  }, [fetchPage]);

  /** Refaz a página que falhou: a primeira recomeça a lista, as outras continuam dela. */
  const retry = useCallback(() => {
    const offset = failedOffset.current;
    if (!offset) {
      reset();
      return;
    }
    if (busy.current) return;
    setLoadingMore(true);
    fetchPage(offset);
  }, [fetchPage, reset]);

  useFocusEffect(
    useCallback(() => {
      reset();
    }, [reset]),
  );

  useReloadOnSync(reset);

  return { items, loading, loadingMore, error, reset, loadMore, retry };
};
