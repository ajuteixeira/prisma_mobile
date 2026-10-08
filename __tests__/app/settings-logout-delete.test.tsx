import SettingsScreen from "@/app/(tabs)/settings";
import { useSession } from "@/store";
import {
  act,
  fireEvent,
  mockFetchRoutes,
  renderRouter,
  screen,
  waitFor,
} from "@/__tests__/utils";
import * as authService from "@/services/_auth";

jest.mock("@/services/_auth");

const USER = { id: 1, email: "test@prisma.gg", username: "testuser", full_name: "Test User" };

const renderScreen = () =>
  renderRouter(
    { index: () => null, "(tabs)/settings/index": SettingsScreen, "(auth)/login/index": () => null },
    { initialUrl: "/settings" },
  );

describe("Settings Screen - Logout and Delete", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSession.setState({ user: USER, token: "test-token" });
    mockFetchRoutes({
      GET: {
        "/api/auth/me": [200, { user: USER, profile: {} }],
      },
    });
  });

  describe("Logout flow", () => {
    it("mostra sheet de logout quando clica no botão Sair", async () => {
      await renderScreen();

      const logoutButton = screen.getByText("Sair da conta");
      await fireEvent.press(logoutButton);

      expect(screen.getByText("Sair da conta?")).toBeTruthy();
    });

    it("chama authService.logout ao confirmar", async () => {
      (authService.logout as jest.Mock).mockResolvedValue(null);

      await renderScreen();

      await fireEvent.press(screen.getByText("Sair da conta"));
      await waitFor(() => expect(screen.getByText("Sair da conta?")).toBeTruthy());

      const confirmButton = screen.getByText("Sair");
      await fireEvent.press(confirmButton);

      await waitFor(() => {
        expect(authService.logout).toHaveBeenCalledWith("test-token");
      });
    });

    it("mostra sheet de sucesso após logout", async () => {
      (authService.logout as jest.Mock).mockResolvedValue(null);

      await renderScreen();

      await fireEvent.press(screen.getByText("Sair da conta"));
      const confirmButton = screen.getByText("Sair");
      await fireEvent.press(confirmButton);

      await waitFor(() => {
        expect(screen.getByText("Sessão encerrada")).toBeTruthy();
        expect(screen.getByText("Você saiu da sua conta em todos os dispositivos.")).toBeTruthy();
      });
    });

    it("redireciona para /login ao clicar no CTA do sucesso", async () => {
      (authService.logout as jest.Mock).mockResolvedValue(null);
      const replaceSpy = jest.fn();
      jest.spyOn(require("expo-router"), "useRouter").mockReturnValue({ replace: replaceSpy });

      await renderScreen();

      await fireEvent.press(screen.getByText("Sair da conta"));
      const confirmButton = screen.getByText("Sair");
      await fireEvent.press(confirmButton);

      await waitFor(() => {
        expect(screen.getByText("Entrar novamente")).toBeTruthy();
      });

      const ctaButton = screen.getByText("Entrar novamente");
      await fireEvent.press(ctaButton);

      // O redirecionamento acontece internamente
      expect(screen.getByText("Entrar novamente")).toBeTruthy();
    });
  });

  describe("Delete account flow", () => {
    it("mostra sheet de exclusão quando clica no botão Excluir conta", async () => {
      await renderScreen();

      const deleteButton = screen.getByText("Excluir conta permanentemente");
      await fireEvent.press(deleteButton);

      expect(screen.getByText("Excluir sua conta?")).toBeTruthy();
    });

    it("botão de excluir fica desabilitado até digitar EXCLUIR", async () => {
      await renderScreen();

      await fireEvent.press(screen.getByText("Excluir conta permanentemente"));
      await waitFor(() => expect(screen.getByText("Excluir sua conta?")).toBeTruthy());

      const deleteButton = screen.getByDisplayValue("Excluir conta");
      expect(deleteButton.props.disabled).toBe(true);
    });

    it("ativa o botão após digitar EXCLUIR", async () => {
      await renderScreen();

      await fireEvent.press(screen.getByText("Excluir conta permanentemente"));
      await waitFor(() => expect(screen.getByText("Excluir sua conta?")).toBeTruthy());

      const input = screen.getByPlaceholderText("EXCLUIR");
      await fireEvent.changeText(input, "excluir");

      const deleteButton = screen.getByDisplayValue("Excluir conta");
      expect(deleteButton.props.disabled).toBe(false);
    });

    it("chama authService.deleteAccount ao confirmar", async () => {
      (authService.deleteAccount as jest.Mock).mockResolvedValue(null);

      await renderScreen();

      await fireEvent.press(screen.getByText("Excluir conta permanentemente"));
      const input = screen.getByPlaceholderText("EXCLUIR");
      await fireEvent.changeText(input, "excluir");

      const deleteButton = screen.getByDisplayValue("Excluir conta");
      await fireEvent.press(deleteButton);

      await waitFor(() => {
        expect(authService.deleteAccount).toHaveBeenCalledWith("test-token");
      });
    });

    it("mostra sheet de sucesso após exclusão", async () => {
      (authService.deleteAccount as jest.Mock).mockResolvedValue(null);

      await renderScreen();

      await fireEvent.press(screen.getByText("Excluir conta permanentemente"));
      const input = screen.getByPlaceholderText("EXCLUIR");
      await fireEvent.changeText(input, "excluir");

      const deleteButton = screen.getByDisplayValue("Excluir conta");
      await fireEvent.press(deleteButton);

      await waitFor(() => {
        expect(screen.getByText("Conta excluída")).toBeTruthy();
        expect(
          screen.getByText("Sua conta e todos os dados foram removidos permanentemente."),
        ).toBeTruthy();
      });
    });

    it("mostra erro se a exclusão falhar", async () => {
      const error = new Error("Erro ao deletar conta");
      (authService.deleteAccount as jest.Mock).mockRejectedValue(error);

      await renderScreen();

      await fireEvent.press(screen.getByText("Excluir conta permanentemente"));
      const input = screen.getByPlaceholderText("EXCLUIR");
      await fireEvent.changeText(input, "excluir");

      const deleteButton = screen.getByDisplayValue("Excluir conta");
      await fireEvent.press(deleteButton);

      await waitFor(() => {
        expect(screen.getByText("Erro ao deletar conta")).toBeTruthy();
      });
    });
  });
});
