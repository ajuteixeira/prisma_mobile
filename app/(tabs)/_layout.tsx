import { SyncBanner } from "@/components/sync";
import { PrismaTabBar } from "@/components/ui";
import { startSync, useSession } from "@/store";
import { Redirect, Tabs } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";

const TabsLayout = () => {
  const token = useSession((state) => state.token);

  useEffect(() => {
    if (token) startSync();
  }, [token]);

  if (!token) return <Redirect href="/login" />;

  return (
    <View className="flex-1">
      <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <PrismaTabBar {...props} />}>
        <Tabs.Screen name="profile/index" options={{ title: "Perfil" }} />
        <Tabs.Screen name="ranking/index" options={{ title: "Ranking" }} />
        <Tabs.Screen name="followers/index" options={{ title: "Seguidores" }} />
        <Tabs.Screen name="settings/index" options={{ title: "Ajustes" }} />
      </Tabs>
      <SyncBanner />
    </View>
  );
};

export default TabsLayout;
