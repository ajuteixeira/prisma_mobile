import { ApiError, authApi } from "@/services";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

describe("authApi.logout", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("envia POST /api/auth/logout com Authorization Bearer", async () => {
    const fetchSpy = jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response("{}", { status: 200 }));

    await authApi.logout("meu-token");

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${API_URL}/api/auth/logout`);
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({ Authorization: "Bearer meu-token" });
  });

  it("resolve quando o servidor responde 204 sem corpo", async () => {
    jest.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 204 }));

    await expect(authApi.logout("token")).resolves.toBeNull();
  });

  it("lança ApiError com a mensagem do corpo quando a resposta é de erro", async () => {
    jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify({ error: "Token inválido" }), { status: 401 }),
      );

    const failure = authApi.logout("token");

    await expect(failure).rejects.toBeInstanceOf(ApiError);
    await expect(failure).rejects.toMatchObject({ status: 401, message: "Token inválido" });
  });
});

describe("authApi.deleteAccount", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("envia DELETE /api/auth/account com Authorization Bearer", async () => {
    const fetchSpy = jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 204 }));

    await authApi.deleteAccount("meu-token");

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${API_URL}/api/auth/account`);
    expect(init.method).toBe("DELETE");
    expect(init.headers).toMatchObject({ Authorization: "Bearer meu-token" });
  });

  it("resolve quando o servidor responde 204 sem corpo", async () => {
    jest.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 204 }));

    await expect(authApi.deleteAccount("token")).resolves.toBeNull();
  });

  it("lança ApiError quando o token é inválido", async () => {
    jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify({ error: "Token inválido ou expirado" }), {
          status: 401,
        }),
      );

    const failure = authApi.deleteAccount("token");

    await expect(failure).rejects.toBeInstanceOf(ApiError);
    await expect(failure).rejects.toMatchObject({
      status: 401,
      message: "Token inválido ou expirado",
    });
  });

  it("lança ApiError quando a conta já foi deletada", async () => {
    jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify({ error: "Usuário não encontrado" }), { status: 404 }),
      );

    const failure = authApi.deleteAccount("token");

    await expect(failure).rejects.toBeInstanceOf(ApiError);
    await expect(failure).rejects.toMatchObject({ status: 404, message: "Usuário não encontrado" });
  });
});
