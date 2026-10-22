import UserProfileScreen from "@/app/user/[username]";
import { useSession } from "@/store";
import { fireEvent, mockFetchRoutes, renderRouter, screen, waitFor } from "@/__tests__/utils";
import { Share } from "react-native";

const USER = { id: 1, email: "carly@prisma.gg", username: "carly", full_name: null };

const ANA = {
  id: 9,
  username: "ana",
  bio: "Só platina.",
  avatar_url: null,
  followers_count: 12,
  following_count: 4,
  pinned_achievements: [
    { id: 1, name: "Fantasma", game_name: "Hades", icon_url: null, position: 1 },
  ],
};

const STATS = {
  stats: { total_achievements: 1234, avg_completion: 50, perfect_games: 2 },
  platform_distribution: [],
};

const ROUTES = {
  "GET /api/profiles/ana": [200, { profile: ANA }] as [number, object],
  "GET /api/profiles/ana/stats": [200, STATS] as [number, object],
  "GET /api/profiles/ana/games": [200, { games: [], next_offset: null }] as [number, object],
};

const renderScreen = (initialUrl = "/user/ana") =>
  renderRouter(
    {
      index: () => null,
      "(tabs)/profile/index": () => null,
      "(tabs)/followers/index": () => null,
      "(auth)/login/index": () => null,
      "user/[username]": UserProfileScreen,
    },
    { initialUrl },
  );

describe("UserProfileScreen", () => {
  beforeEach(() => {
    useSession.setState({ token: "abc", user: USER });
  });

  it("carrega cartão, estatísticas e jogos do perfil pelo username", async () => {
    const fetch = mockFetchRoutes(ROUTES);
    await renderScreen();

    expect(await screen.findByText("@ana")).toBeOnTheScreen();
    expect(screen.getByText("Só platina.")).toBeOnTheScreen();
    expect(screen.getByText("Fantasma")).toBeOnTheScreen();
    expect(await screen.findByText("1.234")).toBeOnTheScreen();
    expect(fetch.mock.calls[0][1]).toMatchObject({ headers: { Authorization: "Bearer abc" } });
  });

  it("é só leitura: sem vincular plataformas, pinagem, detalhes ou seguidores", async () => {
    mockFetchRoutes(ROUTES);
    const view = await renderScreen();

    expect(
      await screen.findByText("Os jogos aparecem quando a pessoa vincular uma plataforma."),
    ).toBeOnTheScreen();
    expect(screen.queryByText("Conectar plataformas")).toBeNull();
    expect(screen.queryByLabelText("Gerenciar conquistas fixadas")).toBeNull();
    expect(screen.queryByLabelText("Detalhes de Fantasma")).toBeNull();

    await fireEvent.press(screen.getByLabelText("12 seguidores"));
    expect(view).toHavePathname("/user/ana");
  });

  it("username inexistente mostra perfil não encontrado", async () => {
    mockFetchRoutes({
      ...ROUTES,
      "GET /api/profiles/ana": [404, { error: "Perfil nao encontrado" }],
    });
    await renderScreen();

    expect(await screen.findByText("Perfil não encontrado.")).toBeOnTheScreen();
  });

  it("compartilha o link público com o username da pessoa", async () => {
    const share = jest.spyOn(Share, "share").mockResolvedValue({ action: "sharedAction" });
    mockFetchRoutes(ROUTES);
    await renderScreen();

    await fireEvent.press(await screen.findByLabelText("Compartilhar perfil"));

    expect(share).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Veja as conquistas de @ana no Prisma: http://api.test/ana",
      }),
    );
  });

  it("voltar sem histórico leva a Seguidores", async () => {
    mockFetchRoutes(ROUTES);
    const view = await renderScreen();

    await fireEvent.press(await screen.findByLabelText("Voltar"));

    expect(view).toHavePathname("/followers");
  });

  it("o próprio username abre a aba Perfil", async () => {
    const fetch = mockFetchRoutes({});
    const view = await renderScreen("/user/Carly");

    await waitFor(() => expect(view).toHavePathname("/profile"));
    expect(fetch).not.toHaveBeenCalled();
  });

  it("sem sessão, vai para o login", async () => {
    useSession.setState({ token: null, user: null });
    const view = await renderScreen();

    await waitFor(() => expect(view).toHavePathname("/login"));
  });
});
