const jsonResponse = (status: number, body?: unknown) =>
  new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

/**
 * Substitui o `fetch` global por uma resposta JSON fixa e devolve o spy, para
 * conferir URL, método e corpo enviados. O `restoreMocks` do `jest.config.js`
 * devolve o `fetch` original ao fim de cada teste.
 */
export const mockFetch = (status: number, body?: unknown) =>
  jest.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse(status, body));

/**
 * Uma resposta por chamada, na ordem, para fluxos com várias requisições. O
 * corpo de um `Response` só pode ser lido uma vez, então cada chamada ganha o seu.
 */
export const mockFetchSequence = (...responses: [status: number, body?: unknown][]) => {
  const spy = jest.spyOn(globalThis, "fetch");
  for (const [status, body] of responses) spy.mockResolvedValueOnce(jsonResponse(status, body));
  return spy;
};

type MockResponse = [status: number, body?: unknown];

/**
 * Responde por rota (`"MÉTODO /caminho"`), para telas que falam com vários
 * endpoints. Uma rota aceita uma resposta ou uma fila, consumida uma por chamada
 * e repetindo a última. Rota sem mock rejeita, para o teste acusar a chamada.
 */
export const mockFetchRoutes = (routes: Record<string, MockResponse | MockResponse[]>) => {
  const queues = Object.fromEntries(
    Object.entries(routes).map(([route, value]) => [
      route,
      typeof value[0] === "number" ? [value as MockResponse] : [...(value as MockResponse[])],
    ]),
  );

  return jest.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
    const route = `${init?.method ?? "GET"} ${new URL(String(input)).pathname}`;
    const queue = queues[route];
    if (!queue) throw new Error(`Rota sem mock: ${route}`);
    const [status, body] = queue.length > 1 ? queue.shift()! : queue[0];
    return jsonResponse(status, body);
  });
};

/** Corpo JSON enviado na primeira chamada a `method` + `path` de um mock de `fetch`. */
export const fetchBodyOf = (spy: jest.SpyInstance, method: string, path: string) => {
  const call = spy.mock.calls.find(
    ([url, init]) => (init?.method ?? "GET") === method && new URL(String(url)).pathname === path,
  );
  return call ? JSON.parse(call[1].body) : undefined;
};

/** Simula falha de rede: o `fetch` rejeita antes de haver resposta HTTP. */
export const mockFetchNetworkError = () =>
  jest.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("Network request failed"));

/** Corpo JSON enviado na `n`-ésima chamada (0 = primeira) de um `mockFetch`. */
export const fetchBody = (spy: jest.SpyInstance, call = 0) =>
  JSON.parse(spy.mock.calls[call][1].body);
