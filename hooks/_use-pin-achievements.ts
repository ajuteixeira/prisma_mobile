import { profileApi, type AchievementOption, type PinnedAchievement } from "@/services";
import { useSession } from "@/store";
import { describeApiError } from "@/utils";
import { useCallback, useEffect, useRef, useState } from "react";

/** Mesmo limite da web e da API. */
export const MAX_PINS = 4;

const describeListError = () => "Não foi possível carregar suas conquistas.";

/**
 * Conquistas desbloqueadas carregadas aos poucos, como nos Seguidores: a busca
 * recomeça da primeira página e `loadMore` traz a próxima. Respostas de uma
 * busca anterior são descartadas.
 */
const useAchievementList = (query: string) => {
  const token = useSession((state) => state.token);
  const [items, setItems] = useState<AchievementOption[] | null>(null);
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
        const page = await profileApi.achievements(token, offset, query);
        if (current !== generation.current) return;
        nextOffset.current = page.next_offset;
        setItems((previous) =>
          offset === 0 ? page.results : [...(previous ?? []), ...page.results],
        );
        setError(null);
      } catch (pageError) {
        if (current !== generation.current) return;
        setError(offset === 0 ? describeListError() : describeApiError(pageError));
      } finally {
        if (current === generation.current) {
          busy.current = false;
          setLoadingMore(false);
        }
      }
    },
    [query, token],
  );

  const reset = useCallback(() => {
    generation.current += 1;
    nextOffset.current = null;
    setItems(null);
    setError(null);
    setLoadingMore(false);
    return fetchPage(0);
  }, [fetchPage]);

  useEffect(() => {
    reset();
  }, [reset]);

  const loadMore = useCallback(() => {
    if (busy.current || nextOffset.current === null) return;
    setLoadingMore(true);
    fetchPage(nextOffset.current);
  }, [fetchPage]);

  return { items, loadingMore, error, reset, loadMore };
};

/**
 * Estado da sheet "Fixar conquistas": a lista paginada, a seleção em ordem
 * (começa pelas fixadas do cartão) e o salvamento, que devolve as novas fixadas.
 */
export const usePinAchievements = (
  pinned: PinnedAchievement[],
  query: string,
  onSaved: () => void,
) => {
  const token = useSession((state) => state.token);
  const list = useAchievementList(query);
  const [selected, setSelected] = useState(() => pinned.map((achievement) => achievement.id));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const toggle = useCallback((id: number) => {
    setSelected((current) => {
      if (current.includes(id)) {
        setError(null);
        return current.filter((item) => item !== id);
      }
      if (current.length >= MAX_PINS) {
        setError(`Você só pode fixar até ${MAX_PINS} conquistas.`);
        return current;
      }
      setError(null);
      return [...current, id];
    });
  }, []);

  const save = useCallback(async () => {
    if (!token || saving) return;
    setSaving(true);
    setError(null);
    try {
      await profileApi.setPinned(token, selected);
      onSaved();
    } catch (saveError) {
      setError(describeApiError(saveError));
    }
    setSaving(false);
  }, [onSaved, saving, selected, token]);

  return { list, selected, toggle, error, saving, save };
};
