import { Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-zinc-100 p-6">
      <View className="w-full max-w-[360px] rounded-2xl bg-white p-6">
        <Text className="text-center text-2xl font-bold text-zinc-900">
          Tela de teste
        </Text>
        <Text className="mt-2 text-center text-base text-zinc-500">
          A Home está funcionando.
        </Text>
      </View>
    </View>
  );
}
