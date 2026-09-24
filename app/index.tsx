import { Redirect } from "expo-router";

export default function Index() {
  // TODO(auth): provisório — abre direto no fluxo de autenticação. Quando a tela
  // de login existir, apontar para ela; depois que a autenticação estiver pronta,
  // redirecionar para `/home` quando houver sessão (`useSession().token`).
  return <Redirect href="/register" />;
}
