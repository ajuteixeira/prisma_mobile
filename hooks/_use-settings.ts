import { ApiError, authService } from "@/services";
import { useSession } from "@/store";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert } from "react-native";

/** Sheet aberto por trás da lista de Configurações (artboard 6d). */
export type SettingsSheet = "logout" | "delete" | "done" | null;

/** Conteúdo do estado final, após a ação ser confirmada. */
type DoneState = {
  title: string;
  text: string;
  cta: string;
};

const DELETE_CONFIRM_WORD = "EXCLUIR";

/**
 * Máquina de estados dos bottom sheets de Configurações. O logout chama
 * `POST /api/auth/logout` com o Bearer da sessão; a exclusão de conta ainda
 * não tem endpoint na API, então o fluxo para no aviso.
 */
export const useSettings = () => {
  const router = useRouter();
  const user = useSession((state) => state.user);
  const signOut = useSession((state) => state.signOut);

  const [sheet, setSheet] = useState<SettingsSheet>(null);
  const [done, setDone] = useState<DoneState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmText, setConfirmTextRaw] = useState("");

  /** O protótipo exige a palavra inteira, sempre em maiúsculas. */
  const setConfirmText = useCallback(
    (value: string) => setConfirmTextRaw(value.toUpperCase()),
    [],
  );

  const openLogout = useCallback(() => {
    setError(null);
    setSheet("logout");
  }, []);

  const openDelete = useCallback(() => {
    setError(null);
    setSheet("delete");
  }, []);

  const close = useCallback(() => {
    if (loading) return;
    setSheet(null);
    setConfirmTextRaw("");
  }, [loading]);

  const confirmLogout = useCallback(async () => {
    if (loading) return;
    setLoading(true);

    try {
      const token = useSession.getState().token;
      if (token) await authService.logout(token);
      signOut();
      setDone({
        title: "Sessão encerrada",
        text: "Você saiu da sua conta em todos os dispositivos.",
        cta: "Entrar novamente",
      });
      setSheet("done");
    } catch (requestError) {
      setSheet(null);
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : "Não foi possível sair. Verifique sua conexão e tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  }, [loading, signOut]);

  const confirmDelete = useCallback(() => {
    // TODO(api): POST /api/auth/delete (ou equivalente) ainda não existe.
    setSheet(null);
    setConfirmTextRaw("");
    Alert.alert("Em breve", "A exclusão de conta ainda não está disponível.");
  }, []);

  const finish = useCallback(() => {
    setSheet(null);
    setDone(null);
    router.replace("/register");
  }, [router]);

  return {
    user,
    sheet,
    done,
    loading,
    error,
    confirmText,
    deleteConfirmed: confirmText === DELETE_CONFIRM_WORD,
    setConfirmText,
    openLogout,
    openDelete,
    close,
    confirmLogout,
    confirmDelete,
    finish,
  };
};
