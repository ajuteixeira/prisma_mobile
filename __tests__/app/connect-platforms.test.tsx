import ConnectPlatformsScreen from "@/app/(auth)/connect-platforms";
import { useSession } from "@/store";
import {
  act,
  fetchBodyOf,
  fireEvent,
  mockFetchRoutes,
  renderRouter,
  screen,
  waitFor,
} from "@/__tests__/utils";
import * as WebBrowser from "expo-web-browser";
import { Alert } from "react-native";
import Toast from "react-native-toast-message";

jest.mock("expo-web-browser", () => ({ openAuthSessionAsync: jest.fn() }));

// O `parse` do expo-linking depende do esquema do app, que não existe no Jest.
jest.mock("expo-linking", () => ({
  ...jest.requireActual("expo-linking"),
  parse: (url: string) => ({ queryParams: Object.fromEntries(new URL(url).searchParams) }),
}));

const openAuthSession = WebBrowser.openAuthSessionAsync as jest.Mock;

const USER = { id: 1, email: "ana@prisma.gg", username: "ana_silva", full_name: "Ana Silva" };

const account = (platform: string, externalUserId = "123") => ({
  platform,
  external_user_id: externalUserId,
  profile_url: null,
  sync_status: "pending",
});

const NONE_LINKED = [200, { platforms: [] }] as [number, unknown];

const code = (value: string) => [
  200,
  { code: value, verification_token: `token-${value}`, expires_in: 600 },
] as [number, unknown];

const renderScreen = () =>
  renderRouter(
    {
      index: () => null,
      "(auth)/connect-platforms/index": ConnectPlatformsScreen,
      "(tabs)/home/index": () => null,
    },
    { initialUrl: "/connect-platforms" },
  );

describe("ConnectPlatformsScreen", () => {
  beforeEach(() => {
    useSession.setState({ token: "abc", user: USER });
    openAuthSession.mockReset();
  });

  it("carrega as contas já vinculadas com o token da sessão", async () => {
    const fetch = mockFetchRoutes({
      "GET /api/platforms": [200, { platforms: [account("retroachievements", "ana_retro")] }],
    });
    await renderScreen();

    expect(await screen.findByText("Conectado · ana_retro")).toBeOnTheScreen();
    expect(screen.getByText("1 de 4 contas vinculadas")).toBeOnTheScreen();
    expect(screen.getByLabelText("Desvincular RetroAchievements")).toBeOnTheScreen();
    expect(fetch.mock.calls[0][1]).toMatchObject({ headers: { Authorization: "Bearer abc" } });
  });

  it("avisa quando não consegue carregar as contas", async () => {
    const toast = jest.spyOn(Toast, "show").mockImplementation(() => undefined);
    mockFetchRoutes({ "GET /api/platforms": [401, { error: "Não autorizado" }] });
    await renderScreen();

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          text1: "Não foi possível carregar suas contas",
          text2: "Sua sessão expirou. Entre novamente.",
        }),
      ),
    );
  });

  it("só conclui com ao menos uma conta vinculada", async () => {
    mockFetchRoutes({ "GET /api/platforms": NONE_LINKED });
    const view = await renderScreen();

    await fireEvent.press(await screen.findByText("Vincule ao menos uma conta"));

    expect(screen.getByText("Nenhuma conta vinculada")).toBeOnTheScreen();
    expect(view).toHavePathname("/connect-platforms");
  });

  it("conclui e segue para a home", async () => {
    mockFetchRoutes({ "GET /api/platforms": [200, { platforms: [account("xbox")] }] });
    const view = await renderScreen();

    await fireEvent.press(await screen.findByText("Concluir e sincronizar"));

    expect(view).toHavePathname("/home");
  });

  it("volta para o login pelo botão do topo", async () => {
    mockFetchRoutes({ "GET /api/platforms": NONE_LINKED });
    const view = await renderScreen();

    await fireEvent.press(screen.getByLabelText("Voltar"));

    expect(view).toHavePathname("/");
  });

  describe("Xbox (OAuth)", () => {
    it("vincula pelo navegador e sincroniza os cards", async () => {
      mockFetchRoutes({
        "GET /api/platforms": [NONE_LINKED, [200, { platforms: [account("xbox")] }]],
        "POST /api/platforms/xbox/connect-url": [200, { url: "https://xbox.test/oauth" }],
      });
      openAuthSession.mockResolvedValue({
        type: "success",
        url: "prisma://connect?status=success&platform=xbox",
      });
      await renderScreen();

      await fireEvent.press(screen.getByLabelText("Conectar Xbox Live"));

      expect(await screen.findByText("1 de 4 contas vinculadas")).toBeOnTheScreen();
      expect(screen.getByLabelText("Desvincular Xbox Live")).toBeOnTheScreen();
      expect(openAuthSession).toHaveBeenCalledWith("https://xbox.test/oauth", "prisma://connect");
    });

    it("volta ao estado inicial quando o login é cancelado", async () => {
      const toast = jest.spyOn(Toast, "show").mockImplementation(() => undefined);
      mockFetchRoutes({
        "GET /api/platforms": NONE_LINKED,
        "POST /api/platforms/xbox/connect-url": [200, { url: "https://xbox.test/oauth" }],
      });
      openAuthSession.mockResolvedValue({ type: "cancel" });
      await renderScreen();

      await fireEvent.press(screen.getByLabelText("Conectar Xbox Live"));
      await waitFor(() => expect(openAuthSession).toHaveBeenCalled());

      expect(screen.getByText("Login com OAuth Microsoft")).toBeOnTheScreen();
      expect(toast).not.toHaveBeenCalled();
    });

    it("mostra o erro devolvido pelo deep link", async () => {
      const toast = jest.spyOn(Toast, "show").mockImplementation(() => undefined);
      mockFetchRoutes({
        "GET /api/platforms": NONE_LINKED,
        "POST /api/platforms/xbox/connect-url": [200, { url: "https://xbox.test/oauth" }],
      });
      openAuthSession.mockResolvedValue({
        type: "success",
        url: "prisma://connect?status=error&platform=xbox&message=Conta%20j%C3%A1%20vinculada",
      });
      await renderScreen();

      await fireEvent.press(screen.getByLabelText("Conectar Xbox Live"));

      await waitFor(() =>
        expect(toast).toHaveBeenCalledWith(
          expect.objectContaining({
            text1: "Não foi possível vincular a conta",
            text2: "Conta já vinculada",
          }),
        ),
      );
      expect(screen.getByText("Login com OAuth Microsoft")).toBeOnTheScreen();
    });
  });

  describe("Steam (chave + OpenID)", () => {
    it("pede a Web API Key e segue para o login da Steam", async () => {
      const fetch = mockFetchRoutes({
        "GET /api/platforms": [NONE_LINKED, [200, { platforms: [account("steam")] }]],
        "POST /api/platforms/steam/connect-url": [200, { url: "https://steam.test/openid" }],
      });
      openAuthSession.mockResolvedValue({
        type: "success",
        url: "prisma://connect?status=success&platform=steam",
      });
      await renderScreen();

      await fireEvent.press(screen.getByLabelText("Conectar Steam"));
      expect(screen.getByText("Configuração de API")).toBeOnTheScreen();

      // Sem a chave o botão do modal não faz nada.
      await fireEvent.press(screen.getByText("Vincular Conta"));
      expect(openAuthSession).not.toHaveBeenCalled();

      await fireEvent.changeText(screen.getByPlaceholderText("Sua chave de API da Steam"), " KEY ");
      await fireEvent.press(screen.getByText("Vincular Conta"));

      expect(await screen.findByText("1 de 4 contas vinculadas")).toBeOnTheScreen();
      expect(screen.queryByText("Configuração de API")).not.toBeOnTheScreen();
      expect(fetchBodyOf(fetch, "POST", "/api/platforms/steam/connect-url")).toEqual({
        api_key: "KEY",
      });
      expect(openAuthSession).toHaveBeenCalledWith("https://steam.test/openid", "prisma://connect");
    });
  });

  describe("PlayStation (código de verificação)", () => {
    const fillCredentials = async () => {
      await fireEvent.changeText(screen.getByPlaceholderText("seu_username_psn"), " ana_psn ");
      await fireEvent.changeText(screen.getByPlaceholderText("Seu token de acesso da PSN"), "npsso");
    };

    it("emite o código, vincula e mostra o PSN ID no card", async () => {
      const fetch = mockFetchRoutes({
        "GET /api/platforms": NONE_LINKED,
        "POST /api/platforms/playstation/verification-code": code("PRISMA-1234"),
        "POST /api/platforms/playstation/connect": [201, { platform: account("playstation") }],
      });
      await renderScreen();

      await fireEvent.press(screen.getByLabelText("Conectar PlayStation"));
      expect(await screen.findByText("PRISMA-1234")).toBeOnTheScreen();

      await fillCredentials();
      await fireEvent.press(screen.getByText("Vincular Conta"));

      expect(await screen.findByText("Conectado · ana_psn")).toBeOnTheScreen();
      expect(screen.queryByText("PRISMA-1234")).not.toBeOnTheScreen();
      expect(fetchBodyOf(fetch, "POST", "/api/platforms/playstation/connect")).toEqual({
        username: "ana_psn",
        api_key: "npsso",
        verification_token: "token-PRISMA-1234",
      });
    });

    it("gera outro código quando o anterior expirou", async () => {
      mockFetchRoutes({
        "GET /api/platforms": NONE_LINKED,
        "POST /api/platforms/playstation/verification-code": [
          code("PRISMA-1111"),
          code("PRISMA-2222"),
        ],
        "POST /api/platforms/playstation/connect": [410, { error: "O código expirou." }],
      });
      await renderScreen();

      await fireEvent.press(screen.getByLabelText("Conectar PlayStation"));
      await screen.findByText("PRISMA-1111");
      await fillCredentials();
      await fireEvent.press(screen.getByText("Vincular Conta"));

      expect(await screen.findByText("O código expirou.")).toBeOnTheScreen();
      expect(await screen.findByText("PRISMA-2222")).toBeOnTheScreen();
      expect(screen.getByText("Nenhuma conta vinculada")).toBeOnTheScreen();
    });

    it("fecha o modal pelo botão Sair", async () => {
      mockFetchRoutes({
        "GET /api/platforms": NONE_LINKED,
        "POST /api/platforms/playstation/verification-code": code("PRISMA-1234"),
      });
      await renderScreen();

      await fireEvent.press(screen.getByLabelText("Conectar PlayStation"));
      await screen.findByText("PRISMA-1234");
      await fireEvent.press(screen.getByText("Sair"));

      expect(screen.queryByText("Configuração de API")).not.toBeOnTheScreen();
    });
  });

  describe("desvincular", () => {
    /** Toca no botão "Desvincular" do `Alert` de confirmação. */
    const confirmAlert = async (alert: jest.SpyInstance) => {
      const buttons = alert.mock.calls[0][2];
      await act(async () => {
        buttons.find((button: { text: string }) => button.text === "Desvincular").onPress();
      });
    };

    it("pede confirmação e remove a conta", async () => {
      const alert = jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
      const fetch = mockFetchRoutes({
        "GET /api/platforms": [200, { platforms: [account("steam")] }],
        "DELETE /api/platforms/steam": [204],
      });
      await renderScreen();

      await fireEvent.press(await screen.findByLabelText("Desvincular Steam"));
      expect(alert.mock.calls[0][0]).toBe("Desvincular Steam?");
      await confirmAlert(alert);

      expect(await screen.findByText("Vincule sua biblioteca Steam")).toBeOnTheScreen();
      expect(screen.getByText("Nenhuma conta vinculada")).toBeOnTheScreen();
      expect(fetch).toHaveBeenCalledWith(
        "http://api.test/api/platforms/steam",
        expect.objectContaining({ method: "DELETE" }),
      );
    });

    it("mantém a conta quando a API recusa", async () => {
      const alert = jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
      const toast = jest.spyOn(Toast, "show").mockImplementation(() => undefined);
      mockFetchRoutes({
        "GET /api/platforms": [200, { platforms: [account("steam")] }],
        "DELETE /api/platforms/steam": [409, { error: "Sincronização em andamento." }],
      });
      await renderScreen();

      await fireEvent.press(await screen.findByLabelText("Desvincular Steam"));
      await confirmAlert(alert);

      await waitFor(() =>
        expect(toast).toHaveBeenCalledWith(
          expect.objectContaining({
            text1: "Não foi possível desvincular Steam",
            text2: "Sincronização em andamento.",
          }),
        ),
      );
      expect(screen.getByLabelText("Desvincular Steam")).toBeOnTheScreen();
    });
  });
});
