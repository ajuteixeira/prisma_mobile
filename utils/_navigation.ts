import type { Href, useRouter } from "expo-router";

/** Volta à tela anterior; sem histórico (app aberto direto na rota), vai para `fallback`. */
export const goBackOr = (router: ReturnType<typeof useRouter>, fallback: Href) => {
  if (router.canGoBack()) router.back();
  else router.replace(fallback);
};
