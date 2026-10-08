import { useSession } from "@/store";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

/**
 * Busca dados com o token da sessão sempre que a tela ganha foco. `fetch` e
 * `describeError` precisam ser estáveis (definidos fora do componente). Sem
 * token não busca e expõe `missingTokenError`.
 */
export const useFocusFetch = <T>(
  fetch: (token: string) => Promise<T>,
  describeError: (error: unknown) => string,
  missingTokenError: string | null = null,
) => {
  const token = useSession((state) => state.token);

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState<string | null>(null);

  // Memorizado à mão: é dependência do `useFocusEffect`, e no Jest não há React Compiler.
  const load = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setError(missingTokenError);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      setData(await fetch(token));
    } catch (requestError) {
      setError(describeError(requestError));
    } finally {
      setLoading(false);
    }
  }, [describeError, fetch, missingTokenError, token]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return { data, loading, error, reload: load };
};
