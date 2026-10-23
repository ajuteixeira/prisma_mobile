import { useSession } from "@/store";
import { describeApiError } from "@/utils";
import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { useReloadOnSync } from "./_use-reload-on-sync";

/** Uma página já normalizada; `next_offset` é `null` no fim. */
export type Page<T> = { items: T[]; next_offset: number | null };

/**
 * Lista carregada aos poucos com o token da sessão: recomeça da primeira página a
 * cada foco, a cada avanço da sincronização e quando `fetchPage` muda (nesse caso
 * a lista anterior some, porque é outra consulta). `loadMore` traz a próxima e
 * `retry` refaz a que falhou. Respostas de um recomeço anterior são descartadas.
 * `fetchPage` e `describeError` precisam ser estáveis.
 */
export const useFocusPages = <T>(
  fetchPage: (token: string, offset: number) => Promise<Page<T>>,
  describeError: () => string,
) => {
  const token = useSession((state) => state.token);
  const [items, setItems] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(Boolean(token));
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nextOffset = useRef<number | null>(null);
  const failedOffset = useRef<number | null>(null);
  const generation = useRef(0);
  const busy = useRef(false);
  const lastFetch = useRef(fetchPage);

  const load = useCallback(
    async (offset: number) => {
      if (!token) return;
      const current = generation.current;
      busy.current = true;
      failedOffset.current = null;
      try {
        const page = await fetchPage(token, offset);
        if (current !== generation.current) return;
        nextOffset.current = page.next_offset;
        setItems((previous) => (offset === 0 ? page.items : [...(previous ?? []), ...page.items]));
        setError(null);
      } catch (pageError) {
        if (current !== generation.current) return;
        failedOffset.current = offset;
        setError(offset > 0 ? describeApiError(pageError) : describeError());
      } finally {
        if (current === generation.current) {
          busy.current = false;
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [describeError, fetchPage, token],
  );

  const reset = useCallback(() => {
    generation.current += 1;
    nextOffset.current = null;
    if (lastFetch.current !== fetchPage) {
      lastFetch.current = fetchPage;
      setItems(null);
      setError(null);
    }
    setLoading(Boolean(token));
    setLoadingMore(false);
    return load(0);
  }, [fetchPage, load, token]);

  const loadMore = useCallback(() => {
    if (busy.current || nextOffset.current === null) return;
    setLoadingMore(true);
    load(nextOffset.current);
  }, [load]);

  /** Refaz a página que falhou: a primeira recomeça a lista, as outras continuam dela. */
  const retry = useCallback(() => {
    const offset = failedOffset.current;
    if (!offset) {
      reset();
      return;
    }
    if (busy.current) return;
    setLoadingMore(true);
    load(offset);
  }, [load, reset]);

  useFocusEffect(
    useCallback(() => {
      reset();
    }, [reset]),
  );

  useReloadOnSync(reset);

  return { items, loading, loadingMore, error, reset, loadMore, retry };
};
