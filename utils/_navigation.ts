import type { Href, useRouter } from "expo-router";

/** Volta à tela anterior; sem histórico (app aberto direto na rota), vai para `fallback`. */
export const goBackOr = (router: ReturnType<typeof useRouter>, fallback: Href) => {
  if (router.canGoBack()) router.back();
  else router.replace(fallback);
};

/** Abre o perfil só leitura de `username` por cima das abas. */
export const openUserProfile = (router: ReturnType<typeof useRouter>, username: string) =>
  router.push({ pathname: "/user/[username]", params: { username } });
