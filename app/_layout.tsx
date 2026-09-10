import { LoadingProvider } from "@/components/_loading";
import "@/styles/global.css";
import { Slot } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

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
