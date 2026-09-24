import LoginScreen from "@/app/(auth)/login";
import { fetchBody, fireEvent, mockFetch, mockFetchNetworkError, renderRouter, screen } from "@/__tests__/utils";
import { useSession } from "@/store";

const USER = { id: 1, email: "ana@prisma.gg", username: "ana", full_name: "Ana" };

const renderScreen = () =>
  renderRouter(
    {
      index: () => null,
      "(auth)/login/index": LoginScreen,
      "(tabs)/home/index": () => null,
    },
    { initialUrl: "/login" },
  );

const fillAndSubmit = async (email: string, password: string) => {
  await fireEvent.changeText(screen.getByPlaceholderText("E-mail"), email);
  await fireEvent.changeText(screen.getByPlaceholderText("Senha"), password);
  await fireEvent.press(screen.getByRole("button", { name: "Entrar" }));
};

describe("LoginScreen", () => {
  afterEach(() => useSession.getState().signOut());

  it("não chama a API com e-mail inválido", async () => {
    const fetch = mockFetch(200, {});
    const view = await renderScreen();

    await fillAndSubmit("ana@", "senha123");

    expect(screen.getByText("Digite um e-mail válido.")).toBeOnTheScreen();
    expect(fetch).not.toHaveBeenCalled();
    expect(view).toHavePathname("/login");
  });

  it("não chama a API sem senha", async () => {
    const fetch = mockFetch(200, {});
    await renderScreen();

    await fillAndSubmit("ana@prisma.gg", "");

    expect(screen.getByText("Digite sua senha.")).toBeOnTheScreen();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("entra, guarda a sessão e abre a home", async () => {
    const fetch = mockFetch(200, { token: "abc", user: USER });
    const view = await renderScreen();

    await fillAndSubmit(" ana@prisma.gg ", "senha123");

    expect(fetch.mock.calls[0][0]).toBe("http://api.test/api/auth/login");
    expect(fetchBody(fetch)).toEqual({ email: "ana@prisma.gg", password: "senha123" });
    expect(useSession.getState()).toMatchObject({ token: "abc", user: USER });
    expect(view).toHavePathname("/home");
  });

  it("mostra erro genérico quando as credenciais estão erradas", async () => {
    mockFetch(401, { error: "Invalid email or password" });
    const view = await renderScreen();

    await fillAndSubmit("ana@prisma.gg", "errada");

    expect(await screen.findByText("E-mail ou senha incorretos.")).toBeOnTheScreen();
    expect(useSession.getState().token).toBeNull();
    expect(view).toHavePathname("/login");
  });

  it("avisa quando não consegue falar com o servidor", async () => {
    mockFetchNetworkError();
    await renderScreen();

    await fillAndSubmit("ana@prisma.gg", "senha123");

    expect(
      await screen.findByText("Não foi possível conectar ao servidor. Tente novamente."),
    ).toBeOnTheScreen();
  });
});
