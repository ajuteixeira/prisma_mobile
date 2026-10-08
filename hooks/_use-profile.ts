import { ApiError, profileApi } from "@/services";
import { SESSION_EXPIRED } from "@/utils";
import { useFocusFetch } from "./_use-focus-fetch";

const fetchProfile = async (token: string) => (await profileApi.me(token)).profile;

const describeProfileError = (error: unknown) =>
  error instanceof ApiError && error.status === 401
    ? SESSION_EXPIRED
    : "Não foi possível carregar seu perfil.";

const describeStatsError = () => "Não foi possível carregar suas estatísticas.";

/** Perfil do usuário logado, recarregado a cada foco porque nome, bio e foto mudam em outra aba. */
export const useProfile = () => useFocusFetch(fetchProfile, describeProfileError, SESSION_EXPIRED);

/** Estatísticas por plataforma, recarregadas a cada foco porque a sincronização muda os números. */
export const useProfileStats = () => useFocusFetch(profileApi.stats, describeStatsError);
