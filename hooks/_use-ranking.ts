import { rankingApi } from "@/services";
import { useFocusFetch } from "./_use-focus-fetch";

const describeRankingError = () => "Não foi possível carregar o ranking.";

/** Ranking recarregado a cada foco, porque seguir alguém ou sincronizar muda as posições. */
export const useRanking = () =>
  useFocusFetch(rankingApi.list, describeRankingError);
