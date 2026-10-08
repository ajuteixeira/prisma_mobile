import { useSession } from "@/store";
import { Redirect } from "expo-router";

export default function Index() {
  const token = useSession((state) => state.token);
  return <Redirect href={token ? "/profile" : "/login"} />;
}
