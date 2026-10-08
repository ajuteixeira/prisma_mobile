import { authApi } from "@/services";
import { useSession } from "@/store";
import { describeApiError } from "@/utils";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { useRequest } from "./_use-request";

const describeDeleteError = (error: unknown) =>
  describeApiError(
    error,
    "Não foi possível excluir a conta. Verifique sua conexão e tente novamente.",
  );

/**
 * Apaga a conta na API, encerra a sessão e leva ao login com um aviso de
 * sucesso. Na falha, a sessão continua.
 */
export const useDeleteAccount = () => {
  const router = useRouter();
  const signOut = useSession((state) => state.signOut);
  const request = useRequest(describeDeleteError);

  const deleteAccount = async () => {
    const { token } = useSession.getState();
    if (!token) return;
    const done = await request.run(async () => {
      await authApi.deleteAccount(token);
      return true;
    });
    if (!done) return;
    signOut();
    router.replace("/login");
    Toast.show({
      type: "success",
      position: "top",
      text1: "Conta excluída",
      text2: "Sua conta e todos os dados foram removidos permanentemente.",
    });
  };

  return {
    deleteAccount,
    loading: request.loading,
    error: request.error,
    clearError: () => request.setError(null),
  };
};
