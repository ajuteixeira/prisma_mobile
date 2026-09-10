import { LoadingProvider } from "@/components/_loading";
import "@/styles/global.css";
import { Slot } from "expo-router";
import { LogBox } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

/**
 * O `moti` reexporta o `SafeAreaView` do core, que está depreciado. O aviso vem
 * de dependência, não do nosso código, e o LogBox o desenha branco-no-branco
 * (o NativeWind faz `cssInterop` no `Pressable` e descarta o `style` em função
 * usado pelo `LogBoxButton`), virando uma barra vazia. Silenciamos o aviso — o
 * Metro continua imprimindo tudo no terminal.
 */
LogBox.ignoreLogs(["SafeAreaView has been deprecated"]);

const RootLayout = () => {
  return (
    <SafeAreaProvider>
        <LoadingProvider>
          <Slot />
        </LoadingProvider>
      <Toast />
    </SafeAreaProvider>
  );
};

export default RootLayout;
