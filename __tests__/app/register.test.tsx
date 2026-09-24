import RegisterScreen from "@/app/(auth)/register";
import { useSession } from "@/store";
import {
  fetchBody,
  fireEvent,
  mockFetch,
  mockFetchNetworkError,
  mockFetchSequence,
  renderRouter,
  screen,
  waitFor,
} from "@/__tests__/utils";

const USER = { id: 1, email: "ana@prisma.gg", username: "ana_silva", full_name: "Ana Silva" };

const renderScreen = () =>
  renderRouter(
    {
      index: () => null,
      "(auth)/register/index": RegisterScreen,
      "(auth)/connect-platforms/index": () => null,
    },
    { initialUrl: "/register" },
  );

const press = (label: string) => fireEvent.press(screen.getByText(label));

const fillIdentity = async (fullName = "Ana Silva", username = "ana_silva") => {
  await fireEvent.changeText(screen.getByPlaceholderText("Nome completo"), fullName);
  await fireEvent.changeText(screen.getByPlaceholderText("nickname"), username);
};

const fillEmail = (email = "ana@prisma.gg") =>
  fireEvent.changeText(screen.getByPlaceholderText("seu@email.com"), email);

const fillPassword = async (password = "Prisma123", confirmation = password) => {
  await fireEvent.changeText(screen.getByPlaceholderText("Senha"), password);
  await fireEvent.changeText(screen.getByPlaceholderText("Confirmar senha"), confirmation);
};

describe("RegisterScreen", () => {
  beforeEach(() => useSession.setState({ token: null, user: null }));

  it("não chama a API com o perfil incompleto", async () => {
    const fetch = mockFetch(200, {});
    await renderScreen();

    await press("Continuar");
    expect(screen.getByText("Informe seu nome completo (mín. 3 caracteres).")).toBeOnTheScreen();

    await fillIdentity("Ana Silva", "an");
    await press("Continuar");
    expect(screen.getByText("Nickname precisa de 3+ caracteres: a-z, 0-9 e _.")).toBeOnTheScreen();

    expect(fetch).not.toHaveBeenCalled();
  });

  it("sanitiza o nickname enquanto digita", async () => {
    await renderScreen();

    await fireEvent.changeText(screen.getByPlaceholderText("nickname"), "Ana Silva!");

    expect(screen.getByDisplayValue("ana_silva_")).toBeOnTheScreen();
  });

  it("não avança quando o nickname já está em uso", async () => {
    const fetch = mockFetch(200, { username: false });
    await renderScreen();

    await fillIdentity();
    await press("Continuar");

    expect(await screen.findByText("Este nickname já está em uso, escolha outro.")).toBeOnTheScreen();
    expect(fetch.mock.calls[0][0]).toBe("http://api.test/api/auth/availability");
    expect(fetchBody(fetch)).toEqual({ username: "ana_silva" });
    expect(screen.getByText("PASSO 1 DE 3")).toBeOnTheScreen();
  });

  it("avisa quando não consegue falar com o servidor", async () => {
    mockFetchNetworkError();
    await renderScreen();

    await fillIdentity();
    await press("Continuar");

    expect(
      await screen.findByText("Não foi possível conectar ao servidor. Tente novamente."),
    ).toBeOnTheScreen();
  });

  it("confere o e-mail antes de ir para a senha", async () => {
    mockFetchSequence([200, { username: true }], [200, { email: false }]);
    await renderScreen();

    await fillIdentity();
    await press("Continuar");
    expect(await screen.findByText("PASSO 2 DE 3")).toBeOnTheScreen();

    await fillEmail("ana@");
    await press("Continuar");
    expect(screen.getByText("Digite um e-mail válido.")).toBeOnTheScreen();

    await fillEmail();
    await press("Continuar");
    expect(await screen.findByText("Este e-mail já está em uso, escolha outro.")).toBeOnTheScreen();
    expect(screen.getByText("PASSO 2 DE 3")).toBeOnTheScreen();
  });

  it("volta um passo pelo botão do topo e sai para o login no primeiro", async () => {
    mockFetch(200, { username: true });
    const view = await renderScreen();

    await fillIdentity();
    await press("Continuar");
    expect(await screen.findByText("PASSO 2 DE 3")).toBeOnTheScreen();

    await fireEvent.press(screen.getByLabelText("Voltar"));
    expect(await screen.findByText("PASSO 1 DE 3")).toBeOnTheScreen();

    await fireEvent.press(screen.getByLabelText("Voltar"));
    expect(view).toHavePathname("/");
  });

  it("exige que as senhas coincidam", async () => {
    const fetch = mockFetchSequence([200, { username: true }], [200, { email: true }]);
    await renderScreen();

    await fillIdentity();
    await press("Continuar");
    await fillEmail();
    await press("Continuar");

    await fillPassword("12345");
    await press("Criar conta");
    expect(screen.getByText("A senha precisa de no mínimo 6 caracteres.")).toBeOnTheScreen();

    await fillPassword("Prisma123", "Prisma124");
    await press("Criar conta");
    expect(screen.getByText("As senhas não coincidem.")).toBeOnTheScreen();

    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("cria a conta, guarda a sessão e segue para as plataformas", async () => {
    const fetch = mockFetchSequence(
      [200, { username: true }],
      [200, { email: true }],
      [201, { token: "abc", user: USER }],
    );
    const view = await renderScreen();

    await fillIdentity(" Ana Silva ");
    await press("Continuar");
    await fillEmail(" ana@prisma.gg ");
    await press("Continuar");
    await fillPassword();
    await press("Criar conta");

    await waitFor(() => expect(view).toHavePathname("/connect-platforms"));
    expect(fetch.mock.calls[2][0]).toBe("http://api.test/api/auth/register");
    expect(fetchBody(fetch, 1)).toEqual({ email: "ana@prisma.gg" });
    expect(fetchBody(fetch, 2)).toEqual({
      email: "ana@prisma.gg",
      password: "Prisma123",
      username: "ana_silva",
      full_name: "Ana Silva",
    });
    expect(useSession.getState()).toMatchObject({ token: "abc", user: USER });
  });

  it("leva ao passo do campo recusado pela API", async () => {
    mockFetchSequence(
      [200, { username: true }],
      [200, { email: true }],
      [422, { errors: { email: ["já está em uso"] } }],
    );
    await renderScreen();

    await fillIdentity();
    await press("Continuar");
    await fillEmail();
    await press("Continuar");
    await fillPassword();
    await press("Criar conta");

    expect(await screen.findByText("E-mail já está em uso.")).toBeOnTheScreen();
    expect(screen.getByText("PASSO 2 DE 3")).toBeOnTheScreen();
    expect(useSession.getState().token).toBeNull();
  });
});
