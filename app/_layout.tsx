import { LoadingProvider } from "@/components/_loading";
import "@/styles/global.css";
import { Slot } from "expo-router";
import Toast from "react-native-toast-message";

const RootLayout = () => {
  return (
    <>
      <LoadingProvider>
        <Slot />
      </LoadingProvider>
      <Toast />
    </>
  );
};

export default RootLayout;
