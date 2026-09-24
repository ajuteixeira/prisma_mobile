import { PrismaTabBar } from "@/components/ui";
import { Tabs } from "expo-router";

const TabsLayout = () => (
  <Tabs
    screenOptions={{ headerShown: false }}
    tabBar={(props) => <PrismaTabBar {...props} />}
  >
    <Tabs.Screen name="profile" options={{ title: "Perfil" }} />
    <Tabs.Screen name="ranking" options={{ title: "Ranking" }} />
    <Tabs.Screen name="followers" options={{ title: "Seguidores" }} />
    <Tabs.Screen name="settings" options={{ title: "Ajustes" }} />
  </Tabs>
);

export default TabsLayout;
