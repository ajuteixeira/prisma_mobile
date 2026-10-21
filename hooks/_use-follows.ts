import { followsApi } from "@/services";
import { useFocusFetch } from "./_use-focus-fetch";

const describeFollowsError = () => "Não foi possível carregar seus seguidores.";

/** Seguidores e seguidos, recarregados a cada foco porque outras telas mudam quem você segue. */
export const useFollows = () =>
  useFocusFetch(followsApi.list, describeFollowsError);
