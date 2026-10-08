import SettingsScreen from "@/app/(tabs)/settings";
import { useSession } from "@/store";
import { fireEvent, mockFetchRoutes, renderRouter, screen, waitFor } from "@/__tests__/utils";
import Toast from "react-native-toast-message";

const USER = { id: 1, email: "carly@prisma.gg", username: "carly", full_name: "Carly Mendes" };

const PROFILE = {
  id: 7,
  username: "carly",
  bio: null,
  avatar_url: null,
  followers_count: 0,
  following_count: 0,
  pinned_achievements: [],
};

const renderScreen = () =>
  renderRouter(
    {
      index: () => null,
      "(tabs)/settings/index": SettingsScreen,
      "(auth)/login/index": () => null,
    },
    { initialUrl: "/settings" },
  );

describe("Ajustes — confirmações", () => {
  beforeEach(() => useSession.setState({ token: "abc", user: USER }));

  it("sai da conta depois de confirmar no diálogo e vai para o login", async () => {
    const fetch = mockFetchRoutes({
      "GET /api/profile": [200, { profile: PROFILE }],
      "POST /api/auth/logout": [204],
    });
    const view = await renderScreen();

    await fireEvent.press(screen.getByText("Sair da conta"));
    expect(screen.getByText("Sair da conta?")).toBeOnTheScreen();

    await fireEvent.press(screen.getByText("Sair"));

    await waitFor(() => expect(view).toHavePathname("/login"));
    const logout = fetch.mock.calls.find(([url]) => String(url).endsWith("/api/auth/logout"));
    expect(logout?.[1]).toMatchObject({ headers: { Authorization: "Bearer abc" } });
    expect(useSession.getState().token).toBeNull();
  });

  it("mostra a falha do logout no próprio diálogo e mantém a sessão", async () => {
    mockFetchRoutes({
      "GET /api/profile": [200, { profile: PROFILE }],
      "POST /api/auth/logout": [500, { error: "Falha no servidor." }],
    });
    const view = await renderScreen();

    await fireEvent.press(screen.getByText("Sair da conta"));
    await fireEvent.press(screen.getByText("Sair"));

    expect(await screen.findByText("Falha no servidor.")).toBeOnTheScreen();
    expect(screen.getByText("Sair da conta?")).toBeOnTheScreen();
    expect(view).toHavePathname("/settings");
    expect(useSession.getState().token).toBe("abc");
  });

  it("cancelar fecha o diálogo sem sair", async () => {
    const fetch = mockFetchRoutes({ "GET /api/profile": [200, { profile: PROFILE }] });
    await renderScreen();

    await fireEvent.press(screen.getByText("Sair da conta"));
    await fireEvent.press(screen.getByText("Cancelar"));

    await waitFor(() => expect(screen.queryByText("Sair da conta?")).not.toBeOnTheScreen());
    expect(fetch.mock.calls.some(([url]) => String(url).endsWith("/api/auth/logout"))).toBe(false);
    expect(useSession.getState().token).toBe("abc");
  });

  it("só exclui depois de digitar EXCLUIR, encerra a sessão e vai para o login", async () => {
    const toast = jest.spyOn(Toast, "show").mockImplementation(() => undefined);
    const fetch = mockFetchRoutes({
      "GET /api/profile": [200, { profile: PROFILE }],
      "DELETE /api/auth/account": [204],
    });
    const view = await renderScreen();

    await fireEvent.press(screen.getByText("Excluir conta permanentemente"));
    expect(screen.getByText("Excluir sua conta?")).toBeOnTheScreen();

    await fireEvent.press(screen.getByText("Excluir conta"));
    const deletes = () => fetch.mock.calls.filter(([, init]) => init?.method === "DELETE");
    expect(deletes()).toHaveLength(0);

    await fireEvent.changeText(screen.getByPlaceholderText("EXCLUIR"), "excluir");
    await fireEvent.press(screen.getByText("Excluir conta"));

    await waitFor(() => expect(view).toHavePathname("/login"));
    expect(deletes()[0]?.[1]).toMatchObject({ headers: { Authorization: "Bearer abc" } });
    expect(useSession.getState().token).toBeNull();
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ text1: "Conta excluída" }));
  });

  it("mostra a falha da exclusão no próprio diálogo e mantém a sessão", async () => {
    mockFetchRoutes({
      "GET /api/profile": [200, { profile: PROFILE }],
      "DELETE /api/auth/account": [500, { error: "Falha ao excluir a conta." }],
    });
    const view = await renderScreen();

    await fireEvent.press(screen.getByText("Excluir conta permanentemente"));
    await fireEvent.changeText(screen.getByPlaceholderText("EXCLUIR"), "EXCLUIR");
    await fireEvent.press(screen.getByText("Excluir conta"));

    expect(await screen.findByText("Falha ao excluir a conta.")).toBeOnTheScreen();
    expect(screen.getByText("Excluir sua conta?")).toBeOnTheScreen();
    expect(view).toHavePathname("/settings");
    expect(useSession.getState().token).toBe("abc");
  });
});
