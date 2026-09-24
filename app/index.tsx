import { useSession } from "@/store";
import { Redirect } from "expo-router";

export default function Index() {
  const token = useSession((state) => state.token);

  // A sessão vive só em memória: ao abrir o app, sempre começa pelo login.
  return <Redirect href={token ? "/home" : "/login"} />;
}
