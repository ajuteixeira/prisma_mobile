import { ApiError, apiRequest } from "@/services";
import { fetchBody, mockFetch, mockFetchNetworkError } from "@/utils/tests";

describe("apiRequest", () => {
  it("faz GET sem corpo e devolve o JSON", async () => {
    const fetch = mockFetch(200, { ok: true });

    await expect(apiRequest("/api/ping")).resolves.toEqual({ ok: true });

    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe("http://api.test/api/ping");
    expect(init).toMatchObject({ method: "GET", body: undefined });
  });

  it("faz POST com JSON e envia o token Bearer", async () => {
    const fetch = mockFetch(201, {});

    await apiRequest("/api/items", { body: { name: "Prisma" }, token: "abc" });

    expect(fetch.mock.calls[0][1]).toMatchObject({
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer abc" },
    });
    expect(fetchBody(fetch)).toEqual({ name: "Prisma" });
  });

  it("transforma `{error}` em ApiError com a mensagem da API", async () => {
    mockFetch(429, { error: "Muitas tentativas." });

    await expect(apiRequest("/api/x", { body: {} })).rejects.toMatchObject({
      name: "ApiError",
      status: 429,
      message: "Muitas tentativas.",
    });
  });

  it("expõe os erros de campo do 422", async () => {
    mockFetch(422, { errors: { email: ["já está em uso"] } });

    const error = await apiRequest("/api/x", { body: {} }).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).fieldErrors).toEqual({ email: ["já está em uso"] });
  });

  it("propaga a falha de rede sem virar ApiError", async () => {
    mockFetchNetworkError();

    await expect(apiRequest("/api/x")).rejects.not.toBeInstanceOf(ApiError);
  });
});
