import { Icon, IconButton, Sheet } from "@/components/ui";
import { COLORS } from "@/constants";
import type { GameAchievement } from "@/services";
import { formatUnlockDate } from "@/utils";
import { memo } from "react";
import { Text, View } from "react-native";
import { AchievementIcon } from "./_achievement-icon";

type GameAchievementSheetProps = {
  /** Conquista aberta; `null` fecha o sheet. */
  achievement: GameAchievement | null;
  gameName: string;
  onClose: () => void;
};

/**
 * Detalhe de uma conquista do jogo, por cima da tela (artboard 8a): ícone
 * grande, nome, jogo, descrição e a data de desbloqueio, ou "Ainda não
 * desbloqueada". Usa os dados que já vieram na lista, sem outra busca.
 */
export const GameAchievementSheet = memo(
  ({ achievement, gameName, onClose }: GameAchievementSheetProps) => (
    <Sheet visible={achievement !== null} onClose={onClose}>
      {achievement ? (
        <View className="items-center px-6 pb-11 pt-2.5">
          <View className="h-[5px] w-10 rounded-full bg-white/20" />
          <View className="absolute right-4 top-4">
            <IconButton
              icon="close"
              variant="ghost"
              color={COLORS.muted}
              accessibilityLabel="Fechar detalhes da conquista"
              onPress={onClose}
            />
          </View>

          <View className="mt-[34px]">
            <AchievementIcon achievement={achievement} size={108} radius={28} />
          </View>

          <Text className="mt-5 text-center text-[20px] font-extrabold text-prisma-ink">
            {achievement.name}
          </Text>

          <View className="mt-2 rounded-full border border-prisma-accent/30 bg-prisma-accent/15 px-3 py-1">
            <Text className="text-[12px] font-semibold text-prisma-accent">{gameName}</Text>
          </View>

          {achievement.description ? (
            <Text className="mt-4 text-center text-[14px] leading-5 text-slate-300">
              {achievement.description}
            </Text>
          ) : null}

          <View className="mt-4 flex-row items-center gap-1.5">
            <Icon
              name={achievement.achieved ? "checkCircle" : "lock"}
              size={12}
              color={achievement.achieved ? COLORS.muted : COLORS.faint}
            />
            <Text
              className="text-[12.5px]"
              style={{ color: achievement.achieved ? COLORS.muted : COLORS.faint }}
            >
              {achievement.achieved
                ? formatUnlockDate(achievement.unlocked_at)
                : "Ainda não desbloqueada"}
            </Text>
          </View>
        </View>
      ) : null}
    </Sheet>
  ),
);

GameAchievementSheet.displayName = "GameAchievementSheet";
