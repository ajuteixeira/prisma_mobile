/** `prisma://connect?status=…`, com ou sem esquema/host. */
const CONNECT_RETURN = /^(?:[a-z][a-z0-9+.-]*:\/\/)?\/?connect(?:[/?#]|$)/i;

/**
 * O retorno do OpenID/OAuth (`prisma://connect?status=…`) é consumido por
 * `WebBrowser.openAuthSessionAsync` na tela de vinculação. Não existe rota
 * `/connect`: com o app aberto, o link é ignorado; numa abertura a frio, leva à
 * tela de vinculação, que recarrega as contas do backend.
 */
export function redirectSystemPath({ path, initial }: { path: string; initial: boolean }) {
  try {
    if (CONNECT_RETURN.test(path)) return initial ? "/connect-platforms" : null;
  } catch {
    // Nunca derrubar o app por causa de um link malformado.
  }
  return path;
}
