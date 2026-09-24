import ForgotPasswordScreen from "@/app/(auth)/forgot-password";
import { fetchBody, fireEvent, mockFetch, renderRouter, screen } from "@/__tests__/utils";

const renderScreen = () =>
  renderRouter(
    { index: () => null, "(auth)/forgot-password/index": ForgotPasswordScreen },
    { initialUrl: "/forgot-password" },
  );

describe("ForgotPasswordScreen", () => {
  it("não chama a API com e-mail inválido", async () => {
    const fetch = mockFetch(202, {});
    const view = await renderScreen();

    await fireEvent.changeText(screen.getByPlaceholderText("E-mail da conta"), "ana@");
    await fireEvent.press(screen.getByText("Enviar link"));

    expect(screen.getByText("Digite um e-mail válido.")).toBeOnTheScreen();
    expect(fetch).not.toHaveBeenCalled();
    expect(view).toHavePathname("/forgot-password");
  });

  it("envia o e-mail e mostra a confirmação do link", async () => {
    const fetch = mockFetch(202, { message: "ok" });
    await renderScreen();

    await fireEvent.changeText(screen.getByPlaceholderText("E-mail da conta"), " ana@prisma.gg ");
    await fireEvent.press(screen.getByText("Enviar link"));

    expect(await screen.findByText("Link enviado")).toBeOnTheScreen();
    expect(fetch.mock.calls[0][0]).toBe("http://api.test/api/auth/password/forgot");
    expect(fetchBody(fetch)).toEqual({ email: "ana@prisma.gg" });
  });
});
