import ProfileScreen from "@/app/(tabs)/profile";
import { useSession } from "@/store";
import { fireEvent, mockFetchRoutes, renderRouter, screen } from "@/__tests__/utils";
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
      "(tabs)/profile": ProfileScreen,
      "(tabs)/followers": () => null,
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
