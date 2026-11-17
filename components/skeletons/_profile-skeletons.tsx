import { memo } from "react";
import { View } from "react-native";
import { Bone, BoneText } from "./_bone";

/** Cartão de perfil: avatar, nome, seguidores/seguindo, bio e conquistas fixadas. */
export const ProfileCardSkeleton = memo(() => (
  <View
    accessibilityLabel="Carregando perfil"
    className="rounded-3xl border border-white/[0.06] bg-prisma-surface px-[18px] pb-[18px] pt-5"
  >
    <View className="flex-row items-center gap-[18px]">
      <Bone variant="circular" className="h-[88px] w-[88px]" />
      <View className="flex-1 gap-3">
        <Bone variant="rounded" className="h-5 w-3/4" />
        <View className="flex-row gap-6">
          <Bone variant="rounded" className="h-8 w-16" />
          <Bone variant="rounded" className="h-8 w-16" />
        </View>
      </View>
    </View>
    <BoneText _lines={2} gap={2} className="mt-3.5 h-3" />
    <View className="mb-4 mt-[18px] h-px bg-white/[0.06]" />
    <Bone variant="rounded" className="mb-3 h-3 w-32" />
    <View className="flex-row gap-2.5">
      {[0, 1, 2, 3].map((i) => (
        <Bone key={i} className="aspect-square flex-1 rounded-[18px]" />
      ))}
    </View>
  </View>
));

ProfileCardSkeleton.displayName = "ProfileCardSkeleton";

/** Destaque "Jogado recentemente": capa, nome, meta e barra de progresso. */
export const RecentlyPlayedSkeleton = memo(() => (
  <View
    accessibilityLabel="Carregando jogos"
    className="overflow-hidden rounded-[22px] border border-white/[0.06] bg-prisma-surface"
  >
    <Bone variant="sharp" className="h-[130px]" />
    <View className="gap-2.5 px-4 pb-4 pt-3.5">
      <Bone variant="rounded" className="h-4 w-2/3" />
      <Bone variant="rounded" className="h-3 w-1/2" />
      <Bone variant="circular" className="mt-2 h-1.5" />
    </View>
  </View>
));

RecentlyPlayedSkeleton.displayName = "RecentlyPlayedSkeleton";

/** Estatísticas e troféus por plataforma. */
export const ProfileStatsSkeleton = memo(() => (
  <View accessibilityLabel="Carregando estatísticas" className="mt-[26px] gap-3">
    <View className="flex-row gap-2 rounded-[20px] border border-white/[0.06] bg-prisma-surface px-3 py-[18px]">
      {[0, 1, 2].map((i) => (
        <View key={i} className="flex-1 items-center gap-2">
          <Bone variant="circular" className="h-3.5 w-3.5" />
          <Bone variant="rounded" className="h-5 w-12" />
          <Bone variant="rounded" className="h-2.5 w-16" />
        </View>
      ))}
    </View>
    <View className="gap-3 rounded-[20px] border border-white/[0.06] bg-prisma-surface p-4">
      <Bone variant="rounded" className="h-3 w-40" />
      <Bone variant="circular" className="h-2.5" />
      <View className="flex-row gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <Bone key={i} variant="rounded" className="h-3.5 flex-1" />
        ))}
      </View>
    </View>
  </View>
));

ProfileStatsSkeleton.displayName = "ProfileStatsSkeleton";
