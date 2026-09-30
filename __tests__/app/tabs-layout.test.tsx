import TabsLayout from "@/app/(tabs)/_layout";
import { fireEvent, renderRouter, screen } from "@/__tests__/utils";

const renderTabs = () =>
  renderRouter(
    {
      "(tabs)/_layout": TabsLayout,
      "(tabs)/profile": () => null,
      "(tabs)/ranking": () => null,
      "(tabs)/followers": () => null,
      "(tabs)/settings/index": () => null,
    },
    { initialUrl: "/profile" },
  );

describe("Tab bar", () => {
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
});
