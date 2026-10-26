import { Icon } from "@/components/ui";
import { COLORS } from "@/constants";
import type { GameAchievement } from "@/services";
import { Image } from "expo-image";
import { useState } from "react";
import { View } from "react-native";

/** Ícone da conquista; sem imagem (ou se falhar) fica o troféu ou o cadeado. */
export const AchievementIcon = ({
  achievement,
  size,
  radius,
}: {
  achievement: GameAchievement;
  size: number;
  radius: number;
}) => {
  const [broken, setBroken] = useState(false);
  const color = achievement.achieved ? COLORS.accent : COLORS.faint;

  return (
    <View
      className="items-center justify-center overflow-hidden border"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        backgroundColor: achievement.achieved ? "rgba(96, 165, 250, 0.1)" : "rgba(107, 114, 128, 0.08)",
        borderColor: achievement.achieved ? "rgba(96, 165, 250, 0.24)" : "rgba(107, 114, 128, 0.18)",
      }}
    >
      {achievement.icon_url && !broken ? (
        <Image
          testID="game-achievement-icon"
          source={{ uri: achievement.icon_url }}
          style={{ width: size, height: size, opacity: achievement.achieved ? 1 : 0.6 }}
          contentFit="cover"
          onError={() => setBroken(true)}
        />
      ) : (
        <Icon name={achievement.achieved ? "trophy" : "lock"} size={size * 0.4} color={color} />
      )}
    </View>
  );
};
