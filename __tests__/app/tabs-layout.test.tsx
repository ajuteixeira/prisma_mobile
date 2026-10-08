import TabsLayout from "@/app/(tabs)/_layout";
import { useSession } from "@/store";
import { fireEvent, renderRouter, screen } from "@/__tests__/utils";

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
  beforeEach(() => useSession.setState({ token: "abc", user: USER }));

  it("mostra as 4 abas do protótipo, na ordem, com Perfil ativo", async () => {
    await renderTabs();

    const tabs = screen.getAllByRole("button").map((tab) => tab.props.accessibilityLabel);
    expect(tabs).toEqual(["Perfil", "Ranking", "Seguidores", "Ajustes"]);
    expect(screen.getByLabelText("Perfil")).toBeSelected();
  });

  it("Ajustes abre as configurações", async () => {
    const view = await renderTabs();

    await fireEvent.press(screen.getByLabelText("Ajustes"));

    expect(view).toHavePathname("/settings");
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
