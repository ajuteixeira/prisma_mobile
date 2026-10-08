import { ApiError, profileApi } from "@/services";
import { mockFetch } from "@/__tests__/utils";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const PROFILE = {
  id: 7,
  username: "carly",
  bio: "Caçadora de platina desde o PS2.",
  avatar_url: null,
  followers_count: 89,
  following_count: 23,
  pinned_achievements: [
    { id: 1, name: "Mestre Atirador", game_name: "CS2", icon_url: null, position: 1 },
  ],
};

describe("profileApi.me", () => {
  it("envia GET /api/profile com Authorization Bearer e devolve o cartão", async () => {
    const fetch = mockFetch(200, { profile: PROFILE });

    await expect(profileApi.me("meu-token")).resolves.toEqual({ profile: PROFILE });

    const [url, init] = fetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${API_URL}/api/profile`);
    expect(init.method).toBe("GET");
    expect(init.headers).toMatchObject({ Authorization: "Bearer meu-token" });
  });

  it("lança ApiError quando o perfil não existe", async () => {
    mockFetch(404, { error: "Perfil nao encontrado" });

    const failure = profileApi.me("token");

    await expect(failure).rejects.toBeInstanceOf(ApiError);
    await expect(failure).rejects.toMatchObject({ status: 404 });
  });
});

describe("profileApi.publicUrl", () => {
  it("aponta para o perfil público na versão web", () => {
    expect(profileApi.publicUrl("carly")).toBe(`${API_URL}/carly`);
  });
});

describe("profileApi.update", () => {
  it("envia PATCH /api/profile com o Bearer e só os campos informados", async () => {
    const fetch = mockFetch(200, { profile: PROFILE, user: { id: 1 } });

    await profileApi.update("meu-token", { bio: "Nova bio" });

    const [url, init] = fetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${API_URL}/api/profile`);
    expect(init.method).toBe("PATCH");
    expect(init.headers).toMatchObject({ Authorization: "Bearer meu-token" });
    expect(JSON.parse(String(init.body))).toEqual({ bio: "Nova bio" });
  });

  it("expõe os erros de campo do 422", async () => {
    mockFetch(422, { errors: { username: ["ja esta em uso"] } });

    await expect(profileApi.update("token", { username: "ana" })).rejects.toMatchObject({
      status: 422,
      fieldErrors: { username: ["ja esta em uso"] },
    });
  });
});

describe("profileApi.stats", () => {
  it("envia GET /api/profile/stats com o Bearer e devolve estatísticas e distribuição", async () => {
    const body = {
      stats: { total_achievements: 2847, avg_completion: 34.2, perfect_games: 8 },
      platform_distribution: [
        { platform_id: 1, name: "Steam", slug: "steam", unlocked: 1708, percentage: 60.0 },
      ],
    };
    const fetch = mockFetch(200, body);

    await expect(profileApi.stats("meu-token")).resolves.toEqual(body);

    const [url, init] = fetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${API_URL}/api/profile/stats`);
    expect(init.method).toBe("GET");
    expect(init.headers).toMatchObject({ Authorization: "Bearer meu-token" });
  });
});
