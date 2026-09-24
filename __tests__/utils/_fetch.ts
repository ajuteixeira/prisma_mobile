/**
 * Substitui o `fetch` global por uma resposta JSON fixa e devolve o spy, para
 * conferir URL, método e corpo enviados. O `restoreMocks` do `jest.config.js`
 * devolve o `fetch` original ao fim de cada teste.
 */
export const mockFetch = (status: number, body?: unknown) =>
  jest.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(body === undefined ? null : JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );

/** Simula falha de rede: o `fetch` rejeita antes de haver resposta HTTP. */
export const mockFetchNetworkError = () =>
  jest.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("Network request failed"));

/** Corpo JSON enviado na `n`-ésima chamada (0 = primeira) de um `mockFetch`. */
export const fetchBody = (spy: jest.SpyInstance, call = 0) =>
  JSON.parse(spy.mock.calls[call][1].body);
