import AuthLayout from "@/app/(auth)/_layout";
import ConnectPlatformsScreen from "@/app/(auth)/connect-platforms";
import ForgotPasswordScreen from "@/app/(auth)/forgot-password";
import TabsLayout from "@/app/(tabs)/_layout";
import SettingsScreen from "@/app/(tabs)/settings";
import RootLayout from "@/app/_layout";
import { useSession } from "@/store";
import { fireEvent, mockFetchRoutes, renderRouter, screen, waitFor } from "@/__tests__/utils";

// O layout raiz importa o CSS do NativeWind, que o Jest não interpreta.
jest.mock("@/styles/global.css", () => ({}));

const USER = { id: 1, email: "carly@prisma.gg", username: "carly", full_name: "Carly Mendes" };
const Empty = () => null;

/** Rotas com os layouts reais do app, para a pilha de navegação ser a mesma. */
const renderApp = () =>
  renderRouter(
    {
      _layout: RootLayout,
      "(tabs)/_layout": TabsLayout,
      "(tabs)/profile/index": Empty,
      "(tabs)/ranking/index": Empty,
      "(tabs)/followers/index": Empty,
      "(tabs)/settings/index": SettingsScreen,
      "(auth)/_layout": AuthLayout,
      "(auth)/connect-platforms/index": ConnectPlatformsScreen,
      "(auth)/forgot-password/index": ForgotPasswordScreen,
    },
    { initialUrl: "/settings" },
  );

describe("voltar entre grupos de rotas", () => {
  beforeEach(() => {
    useSession.setState({ token: "abc", user: USER });
    mockFetchRoutes({
      "GET /api/profile": [200, { profile: { id: 7, username: "carly", pinned_achievements: [] } }],
      "GET /api/platforms": [200, { platforms: [] }],
    });
  });

  it("volta de Contas vinculadas para Ajustes", async () => {
    const view = await renderApp();

    await fireEvent.press(screen.getByText("Contas vinculadas"));
    await waitFor(() => expect(view).toHavePathname("/connect-platforms"));

    await fireEvent.press(screen.getByLabelText("Voltar"));
    await waitFor(() => expect(view).toHavePathname("/settings"));
  });

  it("volta de Alterar senha para Ajustes", async () => {
    const view = await renderApp();

    await fireEvent.press(screen.getByText("Alterar senha"));
    await waitFor(() => expect(view).toHavePathname("/forgot-password"));

    await fireEvent.press(screen.getByLabelText("Voltar"));
    await waitFor(() => expect(view).toHavePathname("/settings"));
  });
});
