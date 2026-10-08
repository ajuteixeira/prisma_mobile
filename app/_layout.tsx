import { LoadingProvider } from "@/components/_loading";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { useSession } from "@/store";
import "@/styles/global.css";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import Toast from "react-native-toast-message";

// A splash fica até a sessão salva ser lida, para nenhuma rota abrir sem saber se há login.
SplashScreen.preventAutoHideAsync().catch(() => undefined);

const RootLayout = () => {
  const hydrated = useSession((state) => state.hydrated);
  const hydrate = useSession((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (hydrated) SplashScreen.hideAsync().catch(() => undefined);
  }, [hydrated]);

  if (!hydrated) return null;

  return (
    <GluestackUIProvider>
      <LoadingProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </LoadingProvider>
      <Toast />
    </GluestackUIProvider>
  );
};

export default RootLayout;
