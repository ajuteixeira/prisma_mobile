import RankingScreen from "@/app/(tabs)/ranking";
import { useSession } from "@/store";
import {
  fireEvent,
  mockFetchRoutes,
  renderRouter,
  screen,
} from "@/__tests__/utils";

const USER = {
  id: 1,
  email: "carly@prisma.gg",
  username: "carly",
  full_name: null,
};

const entry = (overrides: object) => ({
  avatar_url: null,
  platform_counts: {},
  platforms: [],
  is_current_user: false,
  ...overrides,
});

const RANKING = [
  entry({
    profile_id: 1,
    username: "ana",
    achievement_count: 30,
    platform_counts: { steam: 30 },
    platforms: ["steam"],
  }),
  entry({
    profile_id: 2,
    username: "carly",
    achievement_count: 20,
    platform_counts: { steam: 5, xbox: 15 },
    platforms: ["steam", "xbox"],
    is_current_user: true,
  }),
];

const renderScreen = () =>
  renderRouter(
    { index: () => null, "(tabs)/ranking/index": RankingScreen },
    { initialUrl: "/ranking" },
  );

const renderWithProfiles = () =>
  renderRouter(
    {
      index: () => null,
      "(tabs)/ranking/index": RankingScreen,
      "(tabs)/profile/index": () => null,
      "user/[username]": () => null,
    },
    { initialUrl: "/ranking" },
  );

describe("RankingScreen", () => {
  beforeEach(() => {
    useSession.setState({ token: "abc", user: USER });
  });

  it("lista os jogadores na ordem da API", async () => {
    mockFetchRoutes({ "GET /api/ranking": [200, { ranking: RANKING }] });
    await renderScreen();

    expect(
      await screen.findByLabelText("1º, ana, 30 conquistas"),
    ).toBeOnTheScreen();
    expect(screen.getByLabelText("2º, carly, 20 conquistas")).toBeOnTheScreen();
  });

  it("filtra por plataforma e reordena pelas conquistas dela", async () => {
    mockFetchRoutes({ "GET /api/ranking": [200, { ranking: RANKING }] });
    await renderScreen();
    await screen.findByText("ana");

    await fireEvent.press(screen.getByText("Xbox Live"));
    expect(await screen.findByLabelText("1º, carly, 15 conquistas")).toBeOnTheScreen();
    expect(screen.queryByText("ana")).toBeNull();
  });

  it("busca pelo nome", async () => {
    mockFetchRoutes({ "GET /api/ranking": [200, { ranking: RANKING }] });
    await renderScreen();
    await screen.findByText("ana");

    await fireEvent.changeText(screen.getByLabelText("Buscar jogador"), "zzz");
    expect(await screen.findByText("Nenhum jogador encontrado.")).toBeOnTheScreen();
  });

  it("mostra o erro e tenta de novo", async () => {
    mockFetchRoutes({
      "GET /api/ranking": [
        [500, { error: "Falhou" }],
        [200, { ranking: RANKING }],
      ],
    });
    await renderScreen();

    expect(
      await screen.findByText("Não foi possível carregar o ranking."),
    ).toBeOnTheScreen();
    await fireEvent.press(screen.getByText("Tentar novamente"));
    expect(await screen.findByText("ana")).toBeOnTheScreen();
  });

  it("tocar em um jogador abre o perfil dele", async () => {
    mockFetchRoutes({ "GET /api/ranking": [200, { ranking: RANKING }] });
    const view = await renderWithProfiles();

    await fireEvent.press(await screen.findByLabelText("1º, ana, 30 conquistas"));

    expect(view).toHavePathname("/user/ana");
  });

  it("tocar na própria linha abre a aba Perfil", async () => {
    mockFetchRoutes({ "GET /api/ranking": [200, { ranking: RANKING }] });
    const view = await renderWithProfiles();

    await fireEvent.press(await screen.findByLabelText("2º, carly, 20 conquistas"));

    expect(view).toHavePathname("/profile");
  });
});
