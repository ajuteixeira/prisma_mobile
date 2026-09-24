import { Icon } from "@/components/ui";
import { COLORS } from "@/constants";
import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";

/** Placeholder de Seguidores (artboard 6c) — layout ainda será desenhado. */
export default function FollowersScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-prisma-background px-6">
      <StatusBar style="light" />
      <Icon name="users" size={40} color={COLORS.faint} />
      <Text className="mt-4 text-lg font-bold text-prisma-ink">Seguidores</Text>
      <Text className="mt-1 text-center text-sm text-prisma-muted">
        Esta tela ainda está em construção.
      </Text>
    </View>
  );
}
