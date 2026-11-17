import { COLORS } from "@/constants";
import { memo } from "react";
import { View } from "react-native";
import { Bone } from "./_bone";
import { AchievementRowsSkeleton } from "./_list-skeletons";

/** Detalhe do jogo: capa, ícone, nome, chips, progresso e as primeiras conquistas. */
export const GameSkeleton = memo(({ coverHeight }: { coverHeight: number }) => (
  <View accessibilityLabel="Carregando jogo" className="flex-1">
    <Bone variant="sharp" style={{ height: coverHeight }} className="w-full" />
    <View className="-mt-[52px] px-5">
      <View
        className="h-[76px] w-[76px] overflow-hidden rounded-[20px] border-[3px]"
        style={{ borderColor: COLORS.surface }}
      >
        <Bone variant="sharp" />
      </View>
      <Bone variant="rounded" className="mt-3.5 h-6 w-3/4" />
      <View className="mt-3 flex-row gap-2">
        <Bone variant="circular" className="h-[26px] w-24" />
        <Bone variant="circular" className="h-[26px] w-20" />
      </View>
      <Bone className="mt-[18px] h-[74px] rounded-[18px]" />
    </View>
    <View className="mt-6 px-5">
      <AchievementRowsSkeleton count={4} label="Carregando conquistas do jogo" />
    </View>
  </View>
));

GameSkeleton.displayName = "GameSkeleton";
