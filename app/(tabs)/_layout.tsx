import { PrismaTabBar } from "@/components/ui";
import { useSession } from "@/store";
import { Redirect, Tabs } from "expo-router";

/** Telas logadas: sem sessão (logout, token recusado pela API), vai para o login. */
const TabsLayout = () => {
  const token = useSession((state) => state.token);

  if (!token) return <Redirect href="/login" />;

  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <PrismaTabBar {...props} />}>
      <Tabs.Screen name="profile/index" options={{ title: "Perfil" }} />
      <Tabs.Screen name="ranking/index" options={{ title: "Ranking" }} />
      <Tabs.Screen name="followers/index" options={{ title: "Seguidores" }} />
      <Tabs.Screen name="settings/index" options={{ title: "Ajustes" }} />
    </Tabs>
  );
};

export default TabsLayout;
