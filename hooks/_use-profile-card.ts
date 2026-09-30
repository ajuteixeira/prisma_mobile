import { ApiError, profileService, type ProfileCardData } from "@/services";
import { useSession } from "@/store";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Share } from "react-native";

const SESSION_EXPIRED = "Sua sessão expirou. Entre novamente.";

const describeError = (error: unknown) =>
  error instanceof ApiError && error.status === 401
    ? SESSION_EXPIRED
    : "Não foi possível carregar seu perfil.";

/**
 * Cartão da aba Perfil (artboard 6a): busca `GET /api/profile` com o token
 * da sessão e expõe as ações do cartão (compartilhar e abrir seguidores).
 */
export const useProfileCard = () => {
  const router = useRouter();
  const token = useSession((state) => state.token);

  const [profile, setProfile] = useState<ProfileCardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setError(SESSION_EXPIRED);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { profile: data } = await profileService.me(token);
      setProfile(data);
    } catch (requestError) {
      setError(describeError(requestError));
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Recarrega ao voltar para a aba: a edição em Ajustes muda nome, bio e foto.
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const share = useCallback(() => {
    if (!profile) return;
    const url = profileService.publicUrl(profile.username);
    Share.share({ message: `Veja minhas conquistas no Prisma: ${url}`, url }).catch(() => undefined);
  }, [profile]);

  // TODO: abrir já na aba "Seguindo" quando a tela de Seguidores existir (artboard 6c).
  const openFollowers = useCallback(() => router.push("/followers"), [router]);

  return {
    profile,
    loading,
    error,
    reload: load,
    share,
    openFollowers,
    openFollowing: openFollowers,
  };
};
