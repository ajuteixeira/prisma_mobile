import { LoadingProvider } from "@/components/_loading";
import { WebFrame } from "@/components/_web-frame";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { useSession } from "@/store";
import "@/styles/global.css";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { MotiView } from "moti";
import { cssInterop } from "nativewind";
import { useEffect } from "react";
import Toast from "react-native-toast-message";

// O NativeWind só aplica `className` em componentes registrados, e o MotiView vem de fora.
cssInterop(MotiView, { className: "style" });

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

  // O frame envolve o provider para sheets, diálogos e toasts também ficarem na coluna do app.
  return (
    <WebFrame>
      <GluestackUIProvider>
        <LoadingProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </LoadingProvider>
        <Toast />
      </GluestackUIProvider>
    </WebFrame>
  );
};

export default RootLayout;
