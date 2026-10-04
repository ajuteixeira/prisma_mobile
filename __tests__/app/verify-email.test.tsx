import VerifyEmailScreen from "@/app/(auth)/verify-email";
import { useRegistration, useSession } from "@/store";
import {
  fetchBody,
  fireEvent,
  mockFetch,
  renderRouter,
  screen,
  waitFor,
} from "@/__tests__/utils";

const PAYLOAD = {
  email: "ana@prisma.gg",
  password: "Prisma123",
  username: "ana_silva",
  full_name: "Ana Silva",
};
const USER = { id: 1, email: "ana@prisma.gg", username: "ana_silva", full_name: "Ana Silva" };

const renderScreen = ({ resendIn = 60 } = {}) => {
  useRegistration.setState({
    pending: { payload: PAYLOAD, verificationToken: "tok", resendIn },
  });
  return renderRouter(
    {
      index: () => null,
      "(auth)/register/index": () => null,
      "(auth)/verify-email/index": VerifyEmailScreen,
      "(auth)/connect-platforms/index": () => null,
    },
    { initialUrl: "/verify-email" },
  );
};

const typeCode = (code: string) =>
  fireEvent.changeText(screen.getByLabelText("Dígito 1 de 6"), code);

describe("VerifyEmailScreen", () => {
  beforeEach(() => {
    useSession.setState({ token: null, user: null });
    useRegistration.setState({ pending: null });
  });

  it("volta ao cadastro quando não há cadastro pendente", async () => {
    const view = await renderRouter(
      {
        "(auth)/register/index": () => null,
        "(auth)/verify-email/index": VerifyEmailScreen,
      },
      { initialUrl: "/verify-email" },
    );

    expect(view).toHavePathname("/register");
  });

  it("mostra o e-mail e bloqueia o reenvio logo após o envio", async () => {
    await renderScreen();

    expect(screen.getByText("ana@prisma.gg")).toBeOnTheScreen();
    expect(screen.getByText("Reenviar em 1:00")).toBeOnTheScreen();
  });

  it("não chama a API com o código incompleto", async () => {
    const fetch = mockFetch(201, {});
    await renderScreen();

    await typeCode("123");
    await fireEvent.press(screen.getByText("Confirmar código"));

    expect(screen.getByText("Preencha os 6 dígitos do código.")).toBeOnTheScreen();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("cria a conta com o código e segue para as plataformas", async () => {
    const fetch = mockFetch(201, { token: "abc", user: USER });
    const view = await renderScreen();

    await typeCode("123456");
    await fireEvent.press(screen.getByText("Confirmar código"));

    expect(await screen.findByText("E-mail confirmado")).toBeOnTheScreen();
    expect(fetch.mock.calls[0][0]).toBe("http://api.test/api/auth/register");
    expect(fetchBody(fetch)).toEqual({ ...PAYLOAD, code: "123456", verification_token: "tok" });
    expect(useSession.getState()).toMatchObject({ token: "abc", user: USER });
    expect(screen.queryByText("Voltar e alterar dados")).toBeNull();

    await fireEvent.press(screen.getByText("Vincular contas"));

    await waitFor(() => expect(view).toHavePathname("/connect-platforms"));
    expect(useRegistration.getState().pending).toBeNull();
  });

  it("limpa as caixas e mostra o erro quando o código é recusado", async () => {
    mockFetch(422, { error: "Código incorreto. Confira e tente de novo." });
    await renderScreen();

    await typeCode("654321");
    await fireEvent.press(screen.getByText("Confirmar código"));

    expect(await screen.findByText("Código incorreto. Confira e tente de novo.")).toBeOnTheScreen();
    expect(screen.getByLabelText("Dígito 1 de 6").props.value).toBe("");
    expect(useSession.getState().token).toBeNull();
  });

  it("reenvia o código e passa a usar o token novo", async () => {
    const fetch = mockFetch(202, { verification_token: "tok2", expires_in: 600, resend_in: 60 });
    await renderScreen({ resendIn: 0 });

    await fireEvent.press(screen.getByText("Reenviar código"));

    expect(await screen.findByText("Reenviar em 1:00")).toBeOnTheScreen();
    expect(fetch.mock.calls[0][0]).toBe("http://api.test/api/auth/register/code");
    expect(fetchBody(fetch)).toEqual(PAYLOAD);
    expect(useRegistration.getState().pending?.verificationToken).toBe("tok2");
  });

  it("volta ao cadastro para alterar os dados", async () => {
    const view = await renderScreen();

    await fireEvent.press(screen.getByText("Voltar e alterar dados"));

    expect(view).toHavePathname("/register");
  });
});
