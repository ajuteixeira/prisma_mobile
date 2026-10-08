import { useLogout } from "@/hooks/_use-logout";
import { authApi } from "@/services";
import { useSession } from "@/store";
import { act, renderHook } from "@testing-library/react-native";

const mockReplace = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn() }),
}));

/** Serviço mockado: o hook só conversa com `authApi.logout`. */
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
  authApi: { logout: jest.fn() },
  bindSession: jest.fn(),
}));

const logoutMock = authApi.logout as jest.Mock;
const USER = { id: 1, email: "carly@prisma.gg", username: "carly", full_name: null };

const logout = async () => {
  const { result } = await renderHook(() => useLogout());
  await act(() => result.current.logout());
  return result;
};

describe("useLogout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    logoutMock.mockReset();
    useSession.getState().signOut();
  });

  it("chama a API com o token, encerra a sessão local e vai para o login", async () => {
    useSession.getState().signIn({ token: "abc", user: USER });
    logoutMock.mockResolvedValue(null);

    await logout();

    expect(logoutMock).toHaveBeenCalledWith("abc");
    expect(useSession.getState()).toMatchObject({ token: null, user: null });
    expect(mockReplace).toHaveBeenCalledWith("/login");
  });

  it("sem token, só encerra a sessão local", async () => {
    await logout();

    expect(logoutMock).not.toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith("/login");
  });

  it("na falha da API, mantém a sessão e expõe a mensagem do servidor", async () => {
    useSession.getState().signIn({ token: "abc", user: USER });
    const { ApiError } = jest.requireMock("@/services") as typeof import("@/services");
    logoutMock.mockRejectedValue(new ApiError(409, "Sessão em uso"));

    const result = await logout();

    expect(result.current.error).toBe("Sessão em uso");
    expect(useSession.getState().token).toBe("abc");
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("sem resposta do servidor, expõe mensagem genérica", async () => {
    useSession.getState().signIn({ token: "abc", user: USER });
    logoutMock.mockRejectedValue(new TypeError("fetch failed"));

    const result = await logout();

    expect(result.current.error).toBe("Não foi possível sair. Verifique sua conexão e tente novamente.");
  });
});
