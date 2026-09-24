import { useSettings } from "@/hooks/_use-settings";
import { authService } from "@/services";
import { useSession } from "@/store";
import { act, render } from "@testing-library/react-native";
import { Alert } from "react-native";

const mockReplace = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: jest.fn(),
  }),
}));

/** Serviço mockado: o hook só conversa com `authService.logout`. */
jest.mock("@/services", () => ({
  ApiError: class ApiError extends Error {
    readonly status: number;
    readonly fieldErrors: Record<string, string[]>;

    constructor(status: number, message: string, fieldErrors: Record<string, string[]> = {}) {
      super(message);
      this.name = "ApiError";
      this.status = status;
      this.fieldErrors = fieldErrors;
    }
  },
  authService: {
    logout: jest.fn(),
  },
}));

const logoutMock = authService.logout as jest.Mock;
const USER = { id: 1, email: "carly@prisma.gg", username: "carly", full_name: null };

type SettingsFlow = ReturnType<typeof useSettings>;

/** Captura o valor mais recente do hook durante o render (sem depender de effects). */
let current: SettingsFlow;

const Probe = () => {
  current = useSettings();
  return null;
};

const renderFlow = async () => {
  await render(<Probe />);
  return current;
};

describe("useSettings", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    logoutMock.mockReset();
    useSession.getState().signOut();
  });

  it("inicia sem sheet aberto e sem erro", async () => {
    const flow = await renderFlow();

    expect(flow.sheet).toBeNull();
    expect(flow.error).toBeNull();
    expect(flow.deleteConfirmed).toBe(false);
  });

  it("openLogout abre o sheet de confirmação", async () => {
    await renderFlow();

    await act(() => current.openLogout());

    expect(current.sheet).toBe("logout");
  });

  it("close fecha o sheet", async () => {
    await renderFlow();
    await act(() => current.openLogout());

    await act(() => current.close());

    expect(current.sheet).toBeNull();
  });

  it("confirmLogout chama a API com o token da sessão, encerra a sessão local e mostra o sheet de concluído", async () => {
    useSession.getState().signIn({ token: "abc", user: USER });
    logoutMock.mockResolvedValue(null);
    await renderFlow();
    await act(() => current.openLogout());

    await act(async () => {
      await current.confirmLogout();
    });

    expect(logoutMock).toHaveBeenCalledTimes(1);
    expect(logoutMock).toHaveBeenCalledWith("abc");
    expect(useSession.getState().token).toBeNull();
    expect(useSession.getState().user).toBeNull();
    expect(current.sheet).toBe("done");
    expect(current.done?.cta).toBe("Entrar novamente");
  });

  it("confirmLogout sem token de sessão ainda encerra a sessão localmente", async () => {
    logoutMock.mockResolvedValue(null);
    await renderFlow();

    await act(async () => {
      await current.confirmLogout();
    });

    expect(logoutMock).not.toHaveBeenCalled();
    expect(current.sheet).toBe("done");
  });

  it("confirmLogout com erro da API fecha o sheet e expõe a mensagem do servidor", async () => {
    useSession.getState().signIn({ token: "abc", user: USER });
    const { ApiError } = jest.requireMock("@/services") as typeof import("@/services");
    logoutMock.mockRejectedValue(new ApiError(401, "Sessão expirada"));
    await renderFlow();
    await act(() => current.openLogout());

    await act(async () => {
      await current.confirmLogout();
    });

    expect(current.sheet).toBeNull();
    expect(current.error).toBe("Sessão expirada");
    // A sessão local sobrevive à falha: o usuário continua logado.
    expect(useSession.getState().token).toBe("abc");
  });

  it("confirmLogout com falha de rede expõe mensagem genérica", async () => {
    useSession.getState().signIn({ token: "abc", user: USER });
    logoutMock.mockRejectedValue(new TypeError("fetch failed"));
    await renderFlow();

    await act(async () => {
      await current.confirmLogout();
    });

    expect(current.error).toBe(
      "Não foi possível sair. Verifique sua conexão e tente novamente.",
    );
  });

  it("exclusão só confirma com EXCLUIR digitado, e avisa que ainda não está disponível", async () => {
    const alertSpy = jest.spyOn(Alert, "alert");
    await renderFlow();
    await act(() => current.openDelete());
    expect(current.sheet).toBe("delete");

    await act(() => current.setConfirmText("excluir"));
    expect(current.confirmText).toBe("EXCLUIR");
    expect(current.deleteConfirmed).toBe(true);

    await act(() => current.confirmDelete());

    expect(alertSpy).toHaveBeenCalledWith(
      "Em breve",
      "A exclusão de conta ainda não está disponível.",
    );
    expect(current.sheet).toBeNull();
  });

  it("finish redireciona para o login", async () => {
    await renderFlow();

    await act(() => current.finish());

    expect(mockReplace).toHaveBeenCalledWith("/register");
  });
});
