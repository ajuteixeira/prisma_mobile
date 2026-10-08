import { CredentialsModal } from "@/components/auth";
import { PLATFORMS, type Platform } from "@/constants";
import { fireEvent, render, screen } from "@/__tests__/utils";

const PLAYSTATION = PLATFORMS.find((platform) => platform.slug === "playstation")!;

const renderModal = (platform: Platform | null, overrides = {}) => {
  const props = {
    platform,
    loading: false,
    error: null,
    verificationCode: null,
    codeLoading: false,
    onRegenerateCode: jest.fn(),
    onSubmit: jest.fn(),
    onClose: jest.fn(),
    ...overrides,
  };
  return render(<CredentialsModal {...props} />).then(() => props);
};

describe("CredentialsModal", () => {
  it("fica fechado sem plataforma", async () => {
    await renderModal(null);

    expect(screen.queryByText("Configuração de API")).not.toBeOnTheScreen();
  });

  it("só envia com todos os campos preenchidos, sem espaços nas pontas", async () => {
    const props = await renderModal(PLAYSTATION, { verificationCode: "PRISMA-1234" });

    await fireEvent.changeText(screen.getByPlaceholderText("Seu token de acesso da PSN"), "npsso");
    await fireEvent.press(screen.getByText("Vincular Conta"));
    expect(props.onSubmit).not.toHaveBeenCalled();

    await fireEvent.changeText(screen.getByPlaceholderText("seu_username_psn"), " ana_psn ");
    await fireEvent.press(screen.getByText("Vincular Conta"));

    expect(screen.getByText("PRISMA-1234")).toBeOnTheScreen();
    expect(props.onSubmit).toHaveBeenCalledWith(["ana_psn", "npsso"]);
  });

  it("oferece gerar o código quando ele falta", async () => {
    const props = await renderModal(PLAYSTATION);

    await fireEvent.press(screen.getByText("Gerar código"));

    expect(props.onRegenerateCode).toHaveBeenCalledTimes(1);
  });

  it("mostra o erro e fecha pelo Sair", async () => {
    const props = await renderModal(PLAYSTATION, { error: "O código expirou." });

    await fireEvent.press(screen.getByText("Sair"));

    expect(screen.getByText("O código expirou.")).toBeOnTheScreen();
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });
});
