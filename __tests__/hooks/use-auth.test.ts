import { useAuth } from "@/hooks/_use-auth";
import { useSession } from "@/store";
import { mockFetchRoutes, renderHook, waitFor } from "@/__tests__/utils";

const USER = { id: 1, email: "carly@prisma.gg", username: "carly", full_name: null };

describe("useAuth", () => {
  beforeEach(() => {
    useSession.setState({ token: "abc", user: USER });
  });

  it("token válido mantém a sessão", async () => {
    const fetch = mockFetchRoutes({ "GET /api/auth/me": [200, { user: USER }] });
    const { result } = await renderHook(() => useAuth());

    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(result.current.token).toBe("abc");
    expect(useSession.getState().token).toBe("abc");
  });

  it("token recusado pela API encerra a sessão", async () => {
    mockFetchRoutes({ "GET /api/auth/me": [401, { error: "Não autenticado" }] });
    const { result } = await renderHook(() => useAuth());

    await waitFor(() => expect(result.current.token).toBeNull());
    expect(result.current.authenticated).toBe(false);
  });

  it("falha de rede não derruba a sessão", async () => {
    const fetch = mockFetchRoutes({});
    fetch.mockRejectedValue(new TypeError("Network request failed"));
    await renderHook(() => useAuth());

    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(useSession.getState().token).toBe("abc");
  });

  it("sem token não chama a API", async () => {
    useSession.setState({ token: null, user: null });
    const fetch = mockFetchRoutes({});
    const { result } = await renderHook(() => useAuth());

    expect(result.current.authenticated).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });
});
