import GameScreen from "@/app/game/[id]";
import { useSession } from "@/store";
import { fireEvent, mockFetchRoutes, renderRouter, screen } from "@/__tests__/utils";

const USER = { id: 1, email: "carly@prisma.gg", username: "carly", full_name: null };

const GAME = {
  id: 42,
  name: "Counter-Strike: Global Offensive",
  cover_url: "https://cdn.test/capa.jpg",
  icon_url: "https://cdn.test/icone.jpg",
  platform: { slug: "steam", name: "Steam" },
  playtime_minutes: 50700,
  last_played_at: "2025-10-28T23:02:00",
  last_unlock_at: "2025-09-30T20:15:00",
  unlocked_achievements: 142,
  total_achievements: 167,
  completion_percent: 85.0,
};

const achievement = (id: number, name: string, achieved = true) => ({
  id,
  name,
  description: `Descrição de ${name}`,
  icon_url: null,
  achieved,
  unlocked_at: achieved ? "2025-09-30T20:15:00" : null,
});

const page = (items: ReturnType<typeof achievement>[], next_offset: number | null = null) => ({
  achievements: items,
  next_offset,
});

const renderScreen = (initialUrl = "/game/42") =>
  renderRouter(
    {
      index: () => null,
      "(tabs)/profile/index": () => null,
      "(auth)/login/index": () => null,
      "user/[username]": () => null,
      "game/[id]": GameScreen,
    },
    { initialUrl },
  );

const rowNames = () =>
  screen
    .getAllByTestId("game-achievement-row")
    .map((row) => row.props.accessibilityLabel.split(",")[0]);

const achievementCalls = (fetch: jest.SpyInstance) =>
  fetch.mock.calls
    .map(([url]) => new URL(String(url)))
    .filter((url) => url.pathname.endsWith("/achievements"))
    .map((url) => url.search);

describe("GameScreen", () => {
  beforeEach(() => {
    useSession.setState({ token: "abc", user: USER });
  });

  it("mostra capa, chips, progresso e informações do jogo, como na 8a", async () => {
    const fetch = mockFetchRoutes({
      "GET /api/profile/games/42": [200, { game: GAME }],
      "GET /api/profile/games/42/achievements": [200, page([achievement(1, "Fuga")])],
    });
    await renderScreen();

    expect(await screen.findByText("Counter-Strike: Global Offensive")).toBeOnTheScreen();
    expect(screen.getAllByText("Steam").length).toBeGreaterThan(0);
    expect(screen.getByText("845 h jogadas")).toBeOnTheScreen();
    expect(screen.getByText("85% de conclusão")).toBeOnTheScreen();
    expect(screen.getByText("Progresso de conquistas")).toBeOnTheScreen();
    expect(screen.getByText("INFORMAÇÕES DO JOGO")).toBeOnTheScreen();
    expect(screen.getByText("845 h")).toBeOnTheScreen();
    expect(screen.getByText("28 de out. de 2025")).toBeOnTheScreen();
    expect(screen.getByText("30 de set. de 2025")).toBeOnTheScreen();
    expect(screen.getByText("142 desbloqueadas de 167")).toBeOnTheScreen();
    expect(fetch.mock.calls[0][1]).toMatchObject({ headers: { Authorization: "Bearer abc" } });
  });

  it("lista as conquistas e troca o filtro, recomeçando a lista", async () => {
    const fetch = mockFetchRoutes({
      "GET /api/profile/games/42": [200, { game: GAME }],
      "GET /api/profile/games/42/achievements": [
        [200, page([achievement(1, "Fuga"), achievement(2, "Zagreus", false)])],
        [200, page([achievement(2, "Zagreus", false)])],
      ],
    });
    await renderScreen();

    expect(await screen.findByText("Fuga")).toBeOnTheScreen();
    expect(rowNames()).toEqual(["Fuga", "Zagreus"]);
    expect(screen.getByText("Bloqueada · Descrição de Zagreus")).toBeOnTheScreen();

    await fireEvent.press(screen.getByText("Bloqueadas"));

    expect(await screen.findByLabelText("Zagreus, bloqueada")).toBeOnTheScreen();
    expect(rowNames()).toEqual(["Zagreus"]);
    expect(achievementCalls(fetch)).toEqual(["?filter=all&offset=0", "?filter=locked&offset=0"]);
  });

  it("carrega a próxima página de conquistas ao chegar no fim", async () => {
    const fetch = mockFetchRoutes({
      "GET /api/profile/games/42": [200, { game: GAME }],
      "GET /api/profile/games/42/achievements": [
        [200, page([achievement(1, "Fuga")], 20)],
        [200, page([achievement(2, "Elísio")])],
      ],
    });
    await renderScreen();
    expect(await screen.findByText("Fuga")).toBeOnTheScreen();

    await fireEvent(screen.getByTestId("game-achievement-list"), "endReached");

    expect(await screen.findByText("Elísio")).toBeOnTheScreen();
    expect(rowNames()).toEqual(["Fuga", "Elísio"]);

    const calls = achievementCalls(fetch).length;
    await fireEvent(screen.getByTestId("game-achievement-list"), "endReached");
    expect(achievementCalls(fetch)).toHaveLength(calls);
    expect(achievementCalls(fetch)).toContain("?filter=all&offset=20");
  });

  it("tocar numa conquista abre o detalhe por cima, com a data ou o aviso de bloqueada", async () => {
    mockFetchRoutes({
      "GET /api/profile/games/42": [200, { game: GAME }],
      "GET /api/profile/games/42/achievements": [
        200,
        page([achievement(1, "Fuga"), achievement(2, "Zagreus", false)]),
      ],
    });
    await renderScreen();

    await fireEvent.press(await screen.findByLabelText("Fuga, desbloqueada"));

    expect(await screen.findByText("Desbloqueada em 30/09/2025")).toBeOnTheScreen();
    // Na linha da lista e no detalhe aberto por cima.
    expect(screen.getAllByText("Descrição de Fuga")).toHaveLength(2);

    await fireEvent.press(screen.getByLabelText("Fechar detalhes da conquista"));
    await fireEvent.press(screen.getByLabelText("Zagreus, bloqueada"));

    expect(await screen.findByText("Ainda não desbloqueada")).toBeOnTheScreen();
  });

  it("jogo sem conquistas mostra o estado vazio da 8b, sem filtro", async () => {
    mockFetchRoutes({
      "GET /api/profile/games/42": [
        200,
        { game: { ...GAME, unlocked_achievements: 0, total_achievements: 0, playtime_minutes: 0 } },
      ],
      "GET /api/profile/games/42/achievements": [200, page([])],
    });
    await renderScreen();

    expect(
      await screen.findByText("Nenhuma conquista encontrada para este jogo."),
    ).toBeOnTheScreen();
    expect(screen.getByText("0 min jogadas")).toBeOnTheScreen();
    expect(screen.queryByText("Bloqueadas")).not.toBeOnTheScreen();
  });

  it("jogo que não é do perfil mostra o erro e permite tentar de novo", async () => {
    mockFetchRoutes({
      "GET /api/profile/games/42": [
        [404, { error: "Jogo nao encontrado" }],
        [200, { game: GAME }],
      ],
      "GET /api/profile/games/42/achievements": [200, page([])],
    });
    await renderScreen();

    expect(await screen.findByText("Jogo não encontrado.")).toBeOnTheScreen();

    await fireEvent.press(screen.getByLabelText("Tentar carregar o jogo de novo"));

    expect(await screen.findByText("Counter-Strike: Global Offensive")).toBeOnTheScreen();
  });

  it("falha nas conquistas não esconde o jogo e permite tentar de novo", async () => {
    mockFetchRoutes({
      "GET /api/profile/games/42": [200, { game: GAME }],
      "GET /api/profile/games/42/achievements": [
        [500, { error: "Falhou" }],
        [200, page([achievement(1, "Fuga")])],
      ],
    });
    await renderScreen();

    expect(await screen.findByText("Não foi possível carregar as conquistas.")).toBeOnTheScreen();
    expect(screen.getByText("Counter-Strike: Global Offensive")).toBeOnTheScreen();

    await fireEvent.press(screen.getByLabelText("Tentar carregar as conquistas de novo"));

    expect(await screen.findByText("Fuga")).toBeOnTheScreen();
  });

  it("Fechar sem histórico volta para o Perfil", async () => {
    mockFetchRoutes({
      "GET /api/profile/games/42": [200, { game: GAME }],
      "GET /api/profile/games/42/achievements": [200, page([])],
    });
    const view = await renderScreen();
    await screen.findByText("Counter-Strike: Global Offensive");

    await fireEvent.press(screen.getByLabelText("Fechar"));

    expect(view).toHavePathname("/profile");
  });

  it("com username, busca o jogo no perfil da pessoa", async () => {
    const fetch = mockFetchRoutes({
      "GET /api/profiles/ana/games/42": [200, { game: GAME }],
      "GET /api/profiles/ana/games/42/achievements": [200, page([achievement(1, "Fuga")])],
    });
    await renderScreen("/game/42?username=ana");

    expect(await screen.findByText("Fuga")).toBeOnTheScreen();
    expect(fetch.mock.calls.map(([url]) => new URL(String(url)).pathname)).toContain(
      "/api/profiles/ana/games/42",
    );
  });
});
