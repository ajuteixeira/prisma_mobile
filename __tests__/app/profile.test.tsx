import ProfileScreen from "@/app/(tabs)/profile";
import { useSession, useSync } from "@/store";
import {
  act,
  fetchBodyOf,
  fireEvent,
  mockFetchRoutes,
  renderRouter,
  screen,
} from "@/__tests__/utils";
import { Share } from "react-native";

const USER = { id: 1, email: "carly@prisma.gg", username: "carly", full_name: null };

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

const renderScreen = () =>
  renderRouter(
    {
      index: () => null,
      "(tabs)/profile/index": ProfileScreen,
      "(tabs)/followers/index": () => null,
      "(auth)/connect-platforms/index": () => null,
    },
    { initialUrl: "/profile" },
  );

describe("ProfileScreen — cartão de perfil", () => {
  beforeEach(() => {
    useSession.setState({ token: "abc", user: USER });
  });

  it("carrega o cartão com o token da sessão", async () => {
    const fetch = mockFetchRoutes({ "GET /api/profile": [200, { profile: PROFILE }] });
    await renderScreen();

    expect(await screen.findByText("@carly")).toBeOnTheScreen();
    expect(screen.getByText("Caçadora de platina desde o PS2.")).toBeOnTheScreen();
    expect(screen.getByText("Mestre Atirador")).toBeOnTheScreen();
    expect(fetch.mock.calls[0][1]).toMatchObject({ headers: { Authorization: "Bearer abc" } });
  });

  it("mostra o carregamento enquanto a API não responde", async () => {
    jest.spyOn(globalThis, "fetch").mockReturnValue(new Promise(() => undefined));
    await renderScreen();

    expect(screen.getByLabelText("Carregando perfil")).toBeOnTheScreen();
  });

  it("em caso de erro, mostra a mensagem e tenta de novo", async () => {
    mockFetchRoutes({
      "GET /api/profile": [
        [500, { error: "Falhou" }],
        [200, { profile: PROFILE }],
      ],
    });
    await renderScreen();

    expect(await screen.findByText("Não foi possível carregar seu perfil.")).toBeOnTheScreen();

    await fireEvent.press(screen.getByText("Tentar novamente"));

    expect(await screen.findByText("@carly")).toBeOnTheScreen();
  });

  it("sessão expirada pede para entrar de novo", async () => {
    mockFetchRoutes({ "GET /api/profile": [401, { error: "Nao autenticado" }] });
    await renderScreen();

    expect(await screen.findByText("Sua sessão expirou. Entre novamente.")).toBeOnTheScreen();
  });

  it("sem sessão, não fica carregando para sempre", async () => {
    useSession.setState({ token: null, user: null });
    const fetch = mockFetchRoutes({});
    await renderScreen();

    expect(await screen.findByText("Sua sessão expirou. Entre novamente.")).toBeOnTheScreen();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("compartilha o link público do perfil", async () => {
    const share = jest.spyOn(Share, "share").mockResolvedValue({ action: "sharedAction" });
    mockFetchRoutes({ "GET /api/profile": [200, { profile: PROFILE }] });
    await renderScreen();

    await fireEvent.press(await screen.findByLabelText("Compartilhar perfil"));

    expect(share).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("http://api.test/carly") }),
    );
  });

  it("tocar em seguidores abre a aba Seguidores", async () => {
    mockFetchRoutes({ "GET /api/profile": [200, { profile: PROFILE }] });
    const view = await renderScreen();

    await fireEvent.press(await screen.findByLabelText("89 seguidores"));

    expect(view).toHavePathname("/followers");
  });
});

const STATS = {
  stats: { total_achievements: 2847, avg_completion: 34.2, perfect_games: 8 },
  platform_distribution: [
    { platform_id: 1, name: "Steam", slug: "steam", unlocked: 1708, percentage: 60.0 },
    {
      platform_id: 2,
      name: "PlayStation Network",
      slug: "playstation",
      unlocked: 569,
      percentage: 20.0,
    },
    { platform_id: 3, name: "Xbox Live", slug: "xbox", unlocked: 285, percentage: 10.0 },
    {
      platform_id: 4,
      name: "RetroAchievements",
      slug: "retroachievements",
      unlocked: 285,
      percentage: 10.0,
    },
  ],
};

describe("ProfileScreen — estatísticas e troféus por plataforma", () => {
  beforeEach(() => {
    useSession.setState({ token: "abc", user: USER });
  });

  it("carrega as estatísticas com o token da sessão, abaixo do cartão", async () => {
    const fetch = mockFetchRoutes({
      "GET /api/profile": [200, { profile: PROFILE }],
      "GET /api/profile/stats": [200, STATS],
    });
    await renderScreen();

    expect(await screen.findByText("2.847")).toBeOnTheScreen();
    expect(screen.getByText("34%")).toBeOnTheScreen();
    expect(screen.getByLabelText("Steam: 60%")).toBeOnTheScreen();

    const statsCall = fetch.mock.calls.find(([url]) => String(url).endsWith("/api/profile/stats"));
    expect(statsCall?.[1]).toMatchObject({ headers: { Authorization: "Bearer abc" } });
  });

  it("mostra o carregamento das estatísticas enquanto a API não responde", async () => {
    const pending = new Promise<Response>(() => undefined);
    jest.spyOn(globalThis, "fetch").mockImplementation(async (input) =>
      String(input).endsWith("/api/profile/stats")
        ? pending
        : new Response(JSON.stringify({ profile: PROFILE }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
    );
    await renderScreen();

    expect(await screen.findByText("@carly")).toBeOnTheScreen();
    expect(screen.getByLabelText("Carregando estatísticas")).toBeOnTheScreen();
  });

  it("falha nas estatísticas não esconde o cartão e permite tentar de novo", async () => {
    mockFetchRoutes({
      "GET /api/profile": [200, { profile: PROFILE }],
      "GET /api/profile/stats": [
        [500, { error: "Falhou" }],
        [200, STATS],
      ],
    });
    await renderScreen();

    expect(
      await screen.findByText("Não foi possível carregar suas estatísticas."),
    ).toBeOnTheScreen();
    expect(screen.getByText("@carly")).toBeOnTheScreen();

    await fireEvent.press(screen.getByLabelText("Tentar carregar as estatísticas de novo"));

    expect(await screen.findByText("2.847")).toBeOnTheScreen();
  });

  it("sem sessão, não busca as estatísticas", async () => {
    useSession.setState({ token: null, user: null });
    const fetch = mockFetchRoutes({});
    await renderScreen();

    expect(await screen.findByText("Sua sessão expirou. Entre novamente.")).toBeOnTheScreen();
    expect(fetch).not.toHaveBeenCalled();
    expect(screen.queryByLabelText("Carregando estatísticas")).not.toBeOnTheScreen();
  });
});

const recentGame = (id: number, name: string) => ({
  id,
  name,
  cover_url: null,
  platform: { slug: "steam", name: "Steam" },
  playtime_minutes: 600,
  last_played_at: "2026-09-28T15:00:00Z",
  unlocked_achievements: 5,
  total_achievements: 10,
});

const recentlyPlayed = (names: string[]) => ({
  recently_played: names.map((name, index) => recentGame(index + 1, name)),
  total: names.length,
  limit: 4,
  offset: 0,
});

describe("ProfileScreen — jogado recentemente e jogos recentes", () => {
  beforeEach(() => {
    useSession.setState({ token: "abc", user: USER });
  });

  const routes = (recent: [number, unknown] | [number, unknown][]) => ({
    "GET /api/profile": [200, { profile: PROFILE }] as [number, unknown],
    "GET /api/profile/stats": [200, STATS] as [number, unknown],
    "GET /api/profile/recently-played": recent,
  });

  it("destaca o último jogado e lista do 2º ao 4º em jogos recentes", async () => {
    const fetch = mockFetchRoutes(
      routes([200, recentlyPlayed(["Valorant", "Apex Legends", "CS:GO", "Phasmophobia"])]),
    );
    await renderScreen();

    expect(await screen.findByText("JOGADO RECENTEMENTE")).toBeOnTheScreen();
    expect(screen.getByTestId("recently-played-card")).toHaveTextContent(/Valorant/);
    expect(screen.getByText("JOGOS RECENTES")).toBeOnTheScreen();
    expect(
      screen.getAllByTestId("recent-game-row").map((row) => row.props.accessibilityLabel),
    ).toEqual([
      expect.stringContaining("Apex Legends"),
      expect.stringContaining("CS:GO"),
      expect.stringContaining("Phasmophobia"),
    ]);

    const call = fetch.mock.calls.find(([url]) => String(url).includes("/recently-played"));
    expect(String(call?.[0])).toContain("limit=4");
    expect(call?.[1]).toMatchObject({
      headers: { Authorization: "Bearer abc" },
    });
  });

  it("com um jogo só, mostra o destaque e esconde jogos recentes", async () => {
    mockFetchRoutes(routes([200, recentlyPlayed(["Valorant"])]));
    await renderScreen();

    expect(await screen.findByTestId("recently-played-card")).toBeOnTheScreen();
    expect(screen.queryByText("JOGOS RECENTES")).not.toBeOnTheScreen();
  });

  it("recarrega os dados quando a sincronização traz jogos novos", async () => {
    const fetch = mockFetchRoutes(
      routes([
        [200, recentlyPlayed([])],
        [200, recentlyPlayed(["Valorant"])],
      ]),
    );
    await renderScreen();
    expect(await screen.findByText("Nenhum jogo por aqui ainda")).toBeOnTheScreen();

    await act(async () => useSync.setState((state) => ({ revision: state.revision + 1 })));

    expect(await screen.findByTestId("recently-played-card")).toHaveTextContent(/Valorant/);
    const calls = (path: string) =>
      fetch.mock.calls.filter(([url]) => new URL(String(url)).pathname === path).length;
    expect(calls("/api/profile")).toBe(2);
    expect(calls("/api/profile/stats")).toBe(2);
  });

  it("sem jogos, convida a conectar uma plataforma", async () => {
    mockFetchRoutes(routes([200, recentlyPlayed([])]));
    const view = await renderScreen();

    expect(await screen.findByText("Nenhum jogo por aqui ainda")).toBeOnTheScreen();
    expect(screen.queryByText("JOGOS RECENTES")).not.toBeOnTheScreen();

    await fireEvent.press(screen.getByText("Conectar plataformas"));

    expect(view).toHavePathname("/connect-platforms");
  });

  it("mostra o carregamento enquanto a API não responde", async () => {
    const pending = new Promise<Response>(() => undefined);
    jest.spyOn(globalThis, "fetch").mockImplementation(async (input) =>
      String(input).includes("/recently-played")
        ? pending
        : new Response(JSON.stringify({ profile: PROFILE, ...STATS }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
    );
    await renderScreen();

    expect(await screen.findByLabelText("Carregando jogos recentes")).toBeOnTheScreen();
  });

  it("falha nos jogos não esconde o restante e permite tentar de novo", async () => {
    mockFetchRoutes(
      routes([
        [500, { error: "Falhou" }],
        [200, recentlyPlayed(["Valorant"])],
      ]),
    );
    await renderScreen();

    expect(
      await screen.findByText("Não foi possível carregar seus jogos recentes."),
    ).toBeOnTheScreen();
    expect(screen.getByText("@carly")).toBeOnTheScreen();

    await fireEvent.press(screen.getByLabelText("Tentar carregar os jogos recentes de novo"));

    expect(await screen.findByTestId("recently-played-card")).toBeOnTheScreen();
  });
});

const option = (id: number, name: string, position: number | null = null) => ({
  id,
  name,
  game_name: "Hades",
  icon_url: null,
  position,
});

describe("ProfileScreen — fixar conquistas", () => {
  beforeEach(() => {
    useSession.setState({ token: "abc", user: USER });
  });

  const openSheet = async () => {
    await fireEvent.press(await screen.findByLabelText("Gerenciar conquistas fixadas"));
    return screen.findByText("Fixar conquistas");
  };

  it("lista as conquistas desbloqueadas, com as fixadas marcadas", async () => {
    mockFetchRoutes({
      "GET /api/profile": [200, { profile: PROFILE }],
      "GET /api/profile/achievements": [
        200,
        { results: [option(1, "Mestre Atirador", 1), option(2, "Fantasma")], next_offset: null },
      ],
    });
    await renderScreen();
    await openSheet();

    expect(await screen.findByText("Fantasma")).toBeOnTheScreen();
    expect(screen.getByLabelText("Mestre Atirador, fixada")).toBeOnTheScreen();
    expect(screen.getByLabelText("Fantasma")).toBeOnTheScreen();
    expect(screen.getByText("1/4 selecionadas")).toBeOnTheScreen();
  });

  it("carrega a próxima página ao chegar no fim da lista", async () => {
    const fetch = mockFetchRoutes({
      "GET /api/profile": [200, { profile: PROFILE }],
      "GET /api/profile/achievements": [
        [200, { results: [option(1, "Mestre Atirador", 1)], next_offset: 20 }],
        [200, { results: [option(2, "Fantasma")], next_offset: null }],
      ],
    });
    await renderScreen();
    await openSheet();
    await screen.findByLabelText("Mestre Atirador, fixada");

    await fireEvent(screen.getByTestId("pin-achievement-list"), "endReached");

    expect(await screen.findByText("Fantasma")).toBeOnTheScreen();
    const urls = fetch.mock.calls.map(([url]) => String(url));
    expect(urls).toContain("http://api.test/api/profile/achievements?offset=20");

    // Sem próxima página, chegar ao fim de novo não busca mais nada.
    const calls = fetch.mock.calls.length;
    await fireEvent(screen.getByTestId("pin-achievement-list"), "endReached");
    expect(fetch.mock.calls).toHaveLength(calls);
  });

  it("não deixa passar de 4 conquistas", async () => {
    const pinned = [option(1, "A", 1), option(2, "B", 2), option(3, "C", 3), option(4, "D", 4)];
    mockFetchRoutes({
      "GET /api/profile": [200, { profile: { ...PROFILE, pinned_achievements: pinned } }],
      "GET /api/profile/achievements": [
        200,
        {
          results: [
            option(1, "A", 1),
            option(2, "B", 2),
            option(3, "C", 3),
            option(4, "D", 4),
            option(5, "E"),
          ],
          next_offset: null,
        },
      ],
    });
    await renderScreen();
    await openSheet();

    await fireEvent.press(await screen.findByLabelText("E"));

    expect(screen.getByText("Você só pode fixar até 4 conquistas.")).toBeOnTheScreen();
    expect(screen.getByText("4/4 selecionadas")).toBeOnTheScreen();
  });

  it("salva a seleção na ordem e atualiza o cartão", async () => {
    const fetch = mockFetchRoutes({
      "GET /api/profile": [
        [200, { profile: PROFILE }],
        [200, { profile: { ...PROFILE, pinned_achievements: [option(2, "Fantasma", 1)] } }],
      ],
      "GET /api/profile/achievements": [
        200,
        { results: [option(1, "Mestre Atirador", 1), option(2, "Fantasma")], next_offset: null },
      ],
      "PUT /api/profile/pinned-achievements": [
        200,
        { pinned_achievements: [option(2, "Fantasma", 1)] },
      ],
    });
    await renderScreen();
    await openSheet();

    await fireEvent.press(await screen.findByLabelText("Mestre Atirador, fixada"));
    await fireEvent.press(screen.getByLabelText("Fantasma"));
    await fireEvent.press(screen.getByText("Salvar"));

    expect(fetchBodyOf(fetch, "PUT", "/api/profile/pinned-achievements")).toEqual({ ids: [2] });
    expect(await screen.findByTestId("pinned-achievement-name")).toHaveTextContent("Fantasma");
    expect(screen.queryByText("Fixar conquistas")).not.toBeOnTheScreen();
  });

  it("mostra o erro da API ao salvar e mantém a sheet aberta", async () => {
    mockFetchRoutes({
      "GET /api/profile": [200, { profile: PROFILE }],
      "GET /api/profile/achievements": [
        200,
        { results: [option(1, "Mestre Atirador", 1)], next_offset: null },
      ],
      "PUT /api/profile/pinned-achievements": [
        422,
        { error: "Escolha apenas conquistas concluidas." },
      ],
    });
    await renderScreen();
    await openSheet();
    await screen.findByLabelText("Mestre Atirador, fixada");

    await fireEvent.press(screen.getByText("Salvar"));

    expect(await screen.findByText("Escolha apenas conquistas concluidas.")).toBeOnTheScreen();
    expect(screen.getByText("Fixar conquistas")).toBeOnTheScreen();
  });
});
