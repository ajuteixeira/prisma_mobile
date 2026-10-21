import { followsApi, type FollowList, type FollowProfile } from "@/services";
import { useSession } from "@/store";
import { describeApiError } from "@/utils";
import { useCallback, useRef, useState } from "react";
import { useFocusFetch } from "./_use-focus-fetch";

const describeFollowsError = () => "Não foi possível carregar seus seguidores.";

/** Contagens das abas, recarregadas a cada foco porque outras telas mudam quem você segue. */
export const useFollowCounts = () =>
  useFocusFetch(followsApi.counts, describeFollowsError);

/**
 * Uma lista de Seguidores carregada aos poucos: `reset` busca a primeira página
 * e `loadMore` a próxima. Respostas de um `reset` anterior são descartadas.
 */
export const useFollowList = (list: FollowList, query = "") => {
  const token = useSession((state) => state.token);
  const [items, setItems] = useState<FollowProfile[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nextOffset = useRef<number | null>(null);
  const generation = useRef(0);
  const busy = useRef(false);

  const fetchPage = useCallback(
    async (offset: number) => {
      if (!token) return;
      const current = generation.current;
      busy.current = true;
      try {
        const page = await followsApi.page(token, list, offset, query);
        if (current !== generation.current) return;
        nextOffset.current = page.next_offset;
        setItems((previous) =>
          offset === 0 ? page.results : [...(previous ?? []), ...page.results],
        );
        setError(null);
      } catch (pageError) {
        if (current !== generation.current) return;
        setError(offset === 0 ? describeFollowsError() : describeApiError(pageError));
      } finally {
        if (current === generation.current) {
          busy.current = false;
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [list, query, token],
  );

  const reset = useCallback(() => {
    generation.current += 1;
    nextOffset.current = null;
    setLoading(true);
    setLoadingMore(false);
    return fetchPage(0);
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (busy.current || nextOffset.current === null) return;
    setLoadingMore(true);
    fetchPage(nextOffset.current);
  }, [fetchPage]);

  /** Troca itens já carregados sem rebuscar, para não perder a posição da rolagem. */
  const update = useCallback(
    (fn: (items: FollowProfile[]) => FollowProfile[]) =>
      setItems((previous) => previous && fn(previous)),
    [],
  );

  return { items, loading, loadingMore, error, reset, loadMore, update };
};
