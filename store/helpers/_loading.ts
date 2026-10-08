import { create } from "zustand";

/** Um loading em andamento. O objeto identifica a entrada para removê-la ao terminar. */
type Entry = { message?: string };

const useLoading = create<{ entries: Entry[] }>()(() => ({ entries: [] }));

const useIsLoading = () => useLoading((state) => state.entries.length > 0);

/** Texto do loading mais recente que tem mensagem; `null` quando nenhum tem. */
const useLoadingMessage = () =>
  useLoading((state) => state.entries.findLast((entry) => entry.message)?.message ?? null);

/**
 * Executa `action` mantendo o loading global ativo até ela terminar, com sucesso
 * ou erro. Com vários loadings ao mesmo tempo, vale a `message` do mais recente.
 */
const withLoading = async <T>(action: () => Promise<T>, message?: string): Promise<T> => {
  const entry: Entry = { message };
  useLoading.setState((state) => ({ entries: [...state.entries, entry] }));
  try {
    return await action();
  } finally {
    useLoading.setState((state) => ({ entries: state.entries.filter((item) => item !== entry) }));
  }
};

export { useIsLoading, useLoadingMessage, withLoading };
