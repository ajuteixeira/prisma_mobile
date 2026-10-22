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

describe("profileApi.card", () => {
  it("envia GET /api/profile com Authorization Bearer e devolve o cartão", async () => {
    const fetch = mockFetch(200, { profile: PROFILE });

    await expect(profileApi.card("meu-token")).resolves.toEqual({ profile: PROFILE });

    const [url, init] = fetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${API_URL}/api/profile`);
    expect(init.method).toBe("GET");
    expect(init.headers).toMatchObject({ Authorization: "Bearer meu-token" });
  });

  it("lança ApiError quando o perfil não existe", async () => {
    mockFetch(404, { error: "Perfil nao encontrado" });

    const failure = profileApi.card("token");

    await expect(failure).rejects.toBeInstanceOf(ApiError);
    await expect(failure).rejects.toMatchObject({ status: 404 });
  });
});

describe("profileApi com username", () => {
  it("consulta /api/profiles/:username nas três rotas, com o username codificado", async () => {
    const fetch = jest
      .spyOn(globalThis, "fetch")
      .mockImplementation(async () => new Response(JSON.stringify({}), { status: 200 }));

    await profileApi.card("token", "ana maria");
    await profileApi.stats("token", "ana maria");
    await profileApi.games("token", 20, "ana maria");

    expect(fetch.mock.calls.map(([url]) => url)).toEqual([
      `${API_URL}/api/profiles/ana%20maria`,
      `${API_URL}/api/profiles/ana%20maria/stats`,
      `${API_URL}/api/profiles/ana%20maria/games?offset=20`,
    ]);
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

describe("profileApi.games", () => {
  const GAME = {
    id: 42,
    name: "Counter-Strike: Global Offensive",
    cover_url: "https://cdn.test/730.jpg",
    icon_url: "https://cdn.test/730-icon.jpg",
    platform: { slug: "steam", name: "Steam" },
    playtime_minutes: 50700,
    last_played_at: "2025-10-28T23:02:00",
    unlocked_achievements: 142,
    total_achievements: 167,
  };

  it("envia GET /api/profile/games com o Bearer e o offset da página", async () => {
    const fetch = mockFetch(200, {
      games: [{ ...GAME, completion_percent: 85.0 }],
      next_offset: 20,
    });

    await expect(profileApi.games("meu-token", 0)).resolves.toEqual({
      games: [GAME],
      next_offset: 20,
    });

    const [url, init] = fetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${API_URL}/api/profile/games?offset=0`);
    expect(init.method).toBe("GET");
    expect(init.headers).toMatchObject({ Authorization: "Bearer meu-token" });
  });

  it("devolve lista vazia e sem próxima página quando o usuário não tem jogos", async () => {
    mockFetch(200, { games: [], next_offset: null });

    await expect(profileApi.games("token", 0)).resolves.toEqual({ games: [], next_offset: null });
  });

  it("tolera campos ausentes ou com tipo inesperado em cada jogo", async () => {
    mockFetch(200, { games: [{ name: "Roblox", total_achievements: "x" }] });

    await expect(profileApi.games("token", 40)).resolves.toEqual({
      games: [
        {
          id: -41,
          name: "Roblox",
          cover_url: null,
          icon_url: null,
          platform: null,
          playtime_minutes: null,
          last_played_at: null,
          unlocked_achievements: 0,
          total_achievements: 0,
        },
      ],
      next_offset: null,
    });
  });
});

describe("profileApi.achievements", () => {
  it("busca uma página das conquistas desbloqueadas com offset e busca", async () => {
    const page = { results: [{ ...PROFILE.pinned_achievements[0] }], next_offset: 20 };
    const fetch = mockFetch(200, page);

    await expect(profileApi.achievements("meu-token", 20, "hades")).resolves.toEqual(page);

    const [url, init] = fetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${API_URL}/api/profile/achievements?offset=20&q=hades`);
    expect(init.method).toBe("GET");
    expect(init.headers).toMatchObject({ Authorization: "Bearer meu-token" });
  });

  it("não envia q quando a busca está vazia", async () => {
    const fetch = mockFetch(200, { results: [], next_offset: null });

    await profileApi.achievements("token", 0);

    expect(fetch.mock.calls[0][0]).toBe(`${API_URL}/api/profile/achievements?offset=0`);
  });
});

describe("profileApi.setPinned", () => {
  it("envia PUT /api/profile/pinned-achievements com os ids na ordem", async () => {
    const fetch = mockFetch(200, { pinned_achievements: PROFILE.pinned_achievements });

    await expect(profileApi.setPinned("meu-token", [3, 1])).resolves.toEqual({
      pinned_achievements: PROFILE.pinned_achievements,
    });

    const [url, init] = fetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${API_URL}/api/profile/pinned-achievements`);
    expect(init.method).toBe("PUT");
    expect(JSON.parse(String(init.body))).toEqual({ ids: [3, 1] });
  });

  it("expõe o 422 de seleção inválida", async () => {
    mockFetch(422, { error: "Voce so pode fixar ate 4 conquistas." });

    await expect(profileApi.setPinned("token", [1, 2, 3, 4, 5])).rejects.toMatchObject({
      status: 422,
    });
  });
});

describe("profileApi.achievement", () => {
  it("busca os detalhes da conquista pelo id", async () => {
    const achievement = {
      ...PROFILE.pinned_achievements[0],
      description: "Acerte 100 tiros na cabeça.",
      unlocked_at: "2026-03-04T10:20:00",
    };
    const fetch = mockFetch(200, { achievement });

    await expect(profileApi.achievement("meu-token", 1)).resolves.toEqual({ achievement });

    const [url, init] = fetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${API_URL}/api/profile/achievements/1`);
    expect(init.headers).toMatchObject({ Authorization: "Bearer meu-token" });
  });
});
