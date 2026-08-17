// import { LoadingProvider } from "@/components/_loading";
// import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/styles/global.css";
import { Slot } from "expo-router";
import Toast from "react-native-toast-message";

// const Header = () => {
//   return (
//     <View className="bg-white pt-12 px-4 border-b border-gray-200">
//       <Image
//         className="w-[65%] m-auto h-28"
//         source={require("@/assets/logo-comunica.png")}
//       />
//     </View>
//   );
// };

const RootLayout = () => {
  return (
    <>
          <Slot />      
      <Toast />
    </>
  );
};

export default RootLayout;
