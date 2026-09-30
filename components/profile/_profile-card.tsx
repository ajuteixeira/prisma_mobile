import { Icon, SpectrumAvatar } from "@/components/ui";
import { COLORS } from "@/constants";
import type { PinnedAchievement, ProfileCardData } from "@/services";
import { Image } from "expo-image";
import { memo, useState } from "react";
import { Pressable, Text, View } from "react-native";

/** Tons dos quadros das conquistas, na ordem das posições fixadas (artboard 6a). */
const TILE_TINTS = [
  { color: "#f87171", rgb: "248, 113, 113" },
  { color: "#c4b5fd", rgb: "196, 181, 253" },
  { color: "#66c0f4", rgb: "102, 192, 244" },
  { color: "#d4a017", rgb: "212, 160, 23" },
] as const;

const OnlineDot = (
  <View
    className="absolute bottom-1 right-1 h-[15px] w-[15px] rounded-full border-[3px] bg-prisma-success"
    style={{ borderColor: COLORS.surface }}
  />
);

const Stat = memo(
  ({ value, label, onPress }: { value: number; label: string; onPress: () => void }) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${value} ${label.toLowerCase()}`}
      onPress={onPress}
      className="min-w-0 flex-1 items-center gap-0.5"
    >
      <Text className="text-[17px] font-extrabold text-prisma-ink">{value}</Text>
      <Text className="text-[12.5px] text-prisma-muted">{label}</Text>
    </Pressable>
  ),
);

Stat.displayName = "Stat";

const AchievementTile = memo(
  ({ achievement, index }: { achievement: PinnedAchievement; index: number }) => {
    const tint = TILE_TINTS[index % TILE_TINTS.length];
    // Ícones vêm das plataformas e às vezes somem; nesse caso fica o troféu.
    const [broken, setBroken] = useState(false);

    return (
      <View testID="pinned-achievement" className="min-w-0 flex-1 items-center gap-2">
        <View
          className="aspect-square w-full items-center justify-center overflow-hidden rounded-[18px] border"
          style={{ backgroundColor: `rgba(${tint.rgb}, 0.1)`, borderColor: `rgba(${tint.rgb}, 0.22)` }}
        >
          {achievement.icon_url && !broken ? (
            <Image
              testID="pinned-achievement-image"
              source={{ uri: achievement.icon_url }}
              style={{ width: "62%", height: "62%", borderRadius: 10 }}
              contentFit="cover"
              onError={() => setBroken(true)}
            />
          ) : (
            <Icon name="trophy" size={22} color={tint.color} />
          )}
        </View>
        <Text
          testID="pinned-achievement-name"
          numberOfLines={2}
          className="text-center text-[11px] leading-[14px] text-slate-300"
        >
          {achievement.name}
        </Text>
      </View>
    );
  },
);

AchievementTile.displayName = "AchievementTile";

type ProfileCardProps = {
  profile: ProfileCardData;
  onShare: () => void;
  onPressFollowers: () => void;
  onPressFollowing: () => void;
};

/**
 * Cartão do topo do Perfil (artboard 6a): avatar com o anel do espectro,
 * seguidores/seguindo, bio e as até 4 conquistas fixadas.
 */
export const ProfileCard = memo(
  ({ profile, onShare, onPressFollowers, onPressFollowing }: ProfileCardProps) => (
    <View className="rounded-3xl border border-white/[0.06] bg-prisma-surface px-[18px] pb-[18px] pt-5">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Compartilhar perfil"
        onPress={onShare}
        className="absolute right-3 top-3 z-10 h-9 w-9 items-center justify-center rounded-[11px] border border-white/[0.08] bg-white/[0.06]"
      >
        <Icon name="share" size={14} color={COLORS.body} />
      </Pressable>

      <View className="flex-row items-center gap-[18px]">
        <SpectrumAvatar
          username={profile.username}
          uri={profile.avatar_url}
          size={88}
          badge={OnlineDot}
        />
        <View className="min-w-0 flex-1">
          <Text
            numberOfLines={1}
            className="pr-9 text-[21px] font-extrabold text-prisma-ink"
            style={{ letterSpacing: -0.5 }}
          >
            @{profile.username}
          </Text>
          <View className="mt-2.5 flex-row">
            <Stat value={profile.followers_count} label="Seguidores" onPress={onPressFollowers} />
            <Stat value={profile.following_count} label="Seguindo" onPress={onPressFollowing} />
          </View>
        </View>
      </View>

      {profile.bio ? (
        <Text testID="profile-bio" className="mt-3.5 text-[13.5px] leading-5 text-slate-300">
          {profile.bio}
        </Text>
      ) : null}

      <View className="mb-4 mt-[18px] h-px bg-white/[0.06]" />

      <Text className="mb-3 text-[12px] font-semibold text-prisma-muted" style={{ letterSpacing: 1 }}>
        CONQUISTAS FIXADAS
      </Text>

      {profile.pinned_achievements.length > 0 ? (
        <View className="flex-row gap-2.5">
          {profile.pinned_achievements.map((achievement, index) => (
            <AchievementTile key={achievement.id} achievement={achievement} index={index} />
          ))}
          {/* Mantém a largura de 1/4 por quadro mesmo com menos de 4 fixadas. */}
          {Array.from({ length: Math.max(0, 4 - profile.pinned_achievements.length) }, (_, i) => (
            <View key={`empty-${i}`} className="flex-1" />
          ))}
        </View>
      ) : (
        <Text className="text-[13px] text-prisma-faint">Nenhuma conquista fixada ainda.</Text>
      )}
    </View>
  ),
);

ProfileCard.displayName = "ProfileCard";
