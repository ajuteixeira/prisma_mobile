import { memo } from "react";
import { View } from "react-native";
import { Bone } from "./_bone";

const rows = (count: number) => Array.from({ length: count }, (_, i) => i);

/** Linhas do ranking: posição, avatar, nome com plataformas e contagem. */
export const RankingSkeleton = memo(({ count = 6 }: { count?: number }) => (
  <View accessibilityLabel="Carregando ranking" className="gap-2.5">
    {rows(count).map((i) => (
      <View
        key={i}
        className="flex-row items-center gap-3 rounded-[18px] border border-white/[0.06] px-3.5 py-3"
      >
        <Bone variant="circular" className="h-8 w-8" />
        <Bone variant="circular" className="h-11 w-11" />
        <View className="flex-1 gap-2">
          <Bone variant="rounded" className="h-3.5 w-2/3" />
          <View className="flex-row gap-1.5">
            <Bone variant="rounded" className="h-5 w-5" />
            <Bone variant="rounded" className="h-5 w-5" />
          </View>
        </View>
        <View className="items-end gap-1.5">
          <Bone variant="rounded" className="h-4 w-9" />
          <Bone variant="rounded" className="h-2.5 w-14" />
        </View>
      </View>
    ))}
  </View>
));

RankingSkeleton.displayName = "RankingSkeleton";

/** Linhas de seguidores/seguindo: avatar, nome, @ e botão. */
export const FollowersSkeleton = memo(({ count = 7 }: { count?: number }) => (
  <View accessibilityLabel="Carregando seguidores">
    {rows(count).map((i) => (
      <View
        key={i}
        className="flex-row items-center gap-[13px] border-b border-white/[0.05] py-2.5"
      >
        <Bone variant="circular" className="h-12 w-12" />
        <View className="flex-1 gap-2">
          <Bone variant="rounded" className="h-3.5 w-1/2" />
          <Bone variant="rounded" className="h-3 w-1/3" />
        </View>
        <Bone className="h-9 w-[96px] rounded-xl" />
      </View>
    ))}
  </View>
));

FollowersSkeleton.displayName = "FollowersSkeleton";

/** Linhas de conquista: ícone, nome e descrição. */
export const AchievementRowsSkeleton = memo(
  ({ count = 5, label = "Carregando conquistas" }: { count?: number; label?: string }) => (
    <View accessibilityLabel={label} className="gap-2">
      {rows(count).map((i) => (
        <View
          key={i}
          className="flex-row items-center gap-3 rounded-2xl border border-white/[0.06] px-3 py-2.5"
        >
          <Bone className="h-11 w-11 rounded-xl" />
          <View className="flex-1 gap-2">
            <Bone variant="rounded" className="h-3.5 w-1/2" />
            <Bone variant="rounded" className="h-3 w-4/5" />
          </View>
        </View>
      ))}
    </View>
  ),
);

AchievementRowsSkeleton.displayName = "AchievementRowsSkeleton";
