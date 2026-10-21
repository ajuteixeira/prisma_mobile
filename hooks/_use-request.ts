import { withLoading } from "@/store";
import { describeApiError } from "@/utils";
import { useState } from "react";

type DescribeError = (error: unknown) => string | null;

/**
 * Carregando e erro de requisições disparadas pelo usuário, uma por vez, com o
 * loading global ativo enquanto cada uma roda. `describeError` traduz a falha na
 * mensagem exibida.
 */
export const useRequest = (describeError: DescribeError = describeApiError) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Resultado de `request`, ou `undefined` na falha (a mensagem fica em `error`). */
  const run = async <T>(request: () => Promise<T>, onError: DescribeError = describeError) => {
    if (loading) return undefined;
    setLoading(true);
    setError(null);
    try {
      return await withLoading(request);
    } catch (requestError) {
      setError(onError(requestError));
      return undefined;
    } finally {
      setLoading(false);
    }
  };

  return { run, loading, error, setError };
};
