import { profileService, type ProfileStatsResponse } from "@/services";
import { useSession } from "@/store";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

/**
 * Estatísticas e troféus por plataforma da aba Perfil (artboard 6a), via
 * `GET /api/profile/stats`. Sem sessão não busca nada: o cartão de perfil já
 * pede para entrar de novo.
 */
export const useProfileStats = () => {
  const token = useSession((state) => state.token);

  const [data, setData] = useState<ProfileStatsResponse | null>(null);
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      setData(await profileService.stats(token));
    } catch {
      setError("Não foi possível carregar suas estatísticas.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Recarrega ao voltar para a aba: a sincronização das plataformas muda os números.
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return { data, loading, error, reload: load };
};
