import { settings } from "@/config";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

/**
 * Abre a URL de autorização e lê o deep link de retorno
 * `prisma://connect?status=success|error&message=…`. `null` quando o usuário
 * fecha o navegador.
 */
export const authorizeInBrowser = async (url: string) => {
  const result = await WebBrowser.openAuthSessionAsync(url, settings.CONNECT_REDIRECT_URL);
  if (result.type !== "success") return null;

  const { queryParams } = Linking.parse(result.url);
  const message = queryParams?.message;
  return {
    ok: queryParams?.status === "success",
    message: typeof message === "string" ? message : undefined,
  };
};
