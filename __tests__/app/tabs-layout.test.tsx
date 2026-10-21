import TabsLayout from "@/app/(tabs)/_layout";
import { resetSync, useSession } from "@/store";
import { act, fireEvent, mockFetchRoutes, renderRouter, screen } from "@/__tests__/utils";

const USER = { id: 1, email: "carly@prisma.gg", username: "carly", full_name: "Carly Mendes" };

const renderTabs = () =>
  renderRouter(
    {
      "(tabs)/_layout": TabsLayout,
      "(tabs)/profile/index": () => null,
      "(tabs)/ranking/index": () => null,
      "(tabs)/followers/index": () => null,
      "(tabs)/settings/index": () => null,
    },
    { initialUrl: "/profile" },
  );

describe("Tab bar", () => {
  beforeEach(() => {
    useSession.setState({ token: "abc", user: USER });
    resetSync();
  });

  it("mostra as 4 abas do protótipo, na ordem, com Perfil ativo", async () => {
    mockFetchRoutes({ "POST /api/sync": [200, { started: false, sync: { running: false } }] });
    await renderTabs();

    const tabs = screen.getAllByRole("button").map((tab) => tab.props.accessibilityLabel);
    expect(tabs).toEqual(["Perfil", "Ranking", "Seguidores", "Ajustes"]);
    expect(screen.getByLabelText("Perfil")).toBeSelected();
  });

  it("Ajustes abre as configurações", async () => {
    mockFetchRoutes({ "POST /api/sync": [200, { started: false, sync: { running: false } }] });
    const view = await renderTabs();

    await fireEvent.press(screen.getByLabelText("Ajustes"));

    expect(view).toHavePathname("/settings");
  });

  it("sincroniza as contas pendentes ao entrar e mostra o progresso", async () => {
    const fetch = mockFetchRoutes({
      "POST /api/sync": [
        202,
        {
          started: true,
          sync: {
            running: true,
            accounts_total: 1,
            accounts_done: 0,
            current: { platform: "steam", games_done: 4, games_total: 20 },
            platforms: [{ platform: "steam", sync_status: "running" }],
          },
        },
      ],
      "GET /api/sync": [200, { sync: { running: true } }],
    });
    await renderTabs();

    expect(await screen.findByText("Steam · 4 de 20 jogos")).toBeOnTheScreen();
    expect(fetch.mock.calls[0][1]).toMatchObject({
      method: "POST",
      headers: { Authorization: "Bearer abc" },
    });
    await act(async () => resetSync());
  });

  it("sem sessão vai para o login", async () => {
    useSession.setState({ token: null, user: null });

    const view = await renderRouter(
      {
        "(tabs)/_layout": TabsLayout,
        "(tabs)/profile/index": () => null,
        "(auth)/login/index": () => null,
      },
      { initialUrl: "/profile" },
    );

    expect(view).toHavePathname("/login");
  });
});
