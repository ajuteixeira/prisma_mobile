import { CredentialsModal } from "@/components/auth";
import { PLATFORMS, type Platform } from "@/constants";
import { fireEvent, render, screen } from "@/__tests__/utils";

const PLAYSTATION = PLATFORMS.find((platform) => platform.slug === "playstation")!;

const renderModal = (platform: Platform | null, overrides = {}) => {
  const props = {
    platform,
    values: ["", ""],
    onChangeField: jest.fn(),
    ready: false,
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

  it("repassa cada campo com o índice e a plataforma", async () => {
    const props = await renderModal(PLAYSTATION, { verificationCode: "PRISMA-1234" });

    await fireEvent.changeText(screen.getByPlaceholderText("Seu token de acesso da PSN"), "npsso");

    expect(screen.getByText("PRISMA-1234")).toBeOnTheScreen();
    expect(props.onChangeField).toHaveBeenCalledWith("playstation", 1, "npsso");
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
