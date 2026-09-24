import { Icon } from "@/components/ui";
import { COLORS } from "@/constants";
import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";

/** Placeholder do Ranking (artboard 6b) — layout ainda será desenhado. */
export default function RankingScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-prisma-background px-6">
      <StatusBar style="light" />
      <Icon name="trophy" size={40} color={COLORS.faint} />
      <Text className="mt-4 text-lg font-bold text-prisma-ink">Ranking</Text>
      <Text className="mt-1 text-center text-sm text-prisma-muted">
        Esta tela ainda está em construção.
      </Text>
    </View>
  );
}
