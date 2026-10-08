import { authApi } from "@/services";
import { useSession } from "@/store";
import { describeApiError } from "@/utils";
import { useRouter } from "expo-router";
import { useRequest } from "./_use-request";

const describeLogoutError = (error: unknown) =>
  describeApiError(error, "Não foi possível sair. Verifique sua conexão e tente novamente.");

/** Encerra a sessão na API e no app, e leva ao login. Na falha, a sessão local continua. */
export const useLogout = () => {
  const router = useRouter();
  const signOut = useSession((state) => state.signOut);
  const request = useRequest(describeLogoutError);

  const logout = async () => {
    const { token } = useSession.getState();
    const done = await request.run(async () => {
      if (token) await authApi.logout(token);
      return true;
    });
    if (!done) return;
    signOut();
    router.replace("/login");
  };

  return { logout, loading: request.loading, error: request.error, clearError: () => request.setError(null) };
};
