import { PlatformDistributionCard, ProfileCard, ProfileStatsCard } from "@/components/profile";
import { Callout, PrismaBackground } from "@/components/ui";
import { COLORS, PROFILE_BEAMS, PROFILE_HERO_HEIGHT } from "@/constants";
import { useProfileCard, useProfileStats } from "@/hooks";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";

const RetryButton = ({ onPress, label }: { onPress: () => void; label?: string }) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={label}
    onPress={onPress}
    className="h-11 items-center justify-center self-start rounded-xl border border-white/[0.08] bg-white/[0.06] px-4"
  >
    <Text className="text-[14px] font-semibold text-prisma-body">Tentar novamente</Text>
  </Pressable>
);

/** Estatísticas e troféus por plataforma, abaixo do cartão. */
const ProfileStatsSection = () => {
  const { data, loading, error, reload } = useProfileStats();

  if (data) {
    return (
      <View className="mt-[26px] gap-3">
        <ProfileStatsCard stats={data.stats} />
        <PlatformDistributionCard distribution={data.platform_distribution} />
      </View>
    );
  }

  if (error) {
    return (
      <View className="mt-[26px] gap-3">
        <Callout tone="danger">{error}</Callout>
        <RetryButton onPress={reload} label="Tentar carregar as estatísticas de novo" />
      </View>
    );
  }

  if (!loading) return null;

  return (
    <View
      accessibilityLabel="Carregando estatísticas"
      className="mt-[26px] h-[220px] items-center justify-center rounded-[20px] border border-white/[0.06] bg-prisma-surface"
    >
      <ActivityIndicator color={COLORS.accent} />
    </View>
  );
};

/**
 * Perfil (artboard 6a), primeira aba após o login: cartão de perfil,
 * estatísticas e troféus por plataforma. Jogado recentemente e jogos
 * recentes entram depois.
 */
export default function ProfileScreen() {
  const card = useProfileCard();

  return (
    <View className="flex-1 bg-prisma-background">
      <StatusBar style="light" />

      <View
        pointerEvents="none"
        className="absolute left-0 right-0 top-0 overflow-hidden"
        style={{ height: PROFILE_HERO_HEIGHT }}
      >
        <PrismaBackground beams={PROFILE_BEAMS} scrim="transparent" />
        <LinearGradient
          colors={["rgba(10, 14, 20, 0.55)", COLORS.background]}
          style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
        />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-[120px] pt-[64px]"
        showsVerticalScrollIndicator={false}
      >
        {card.profile ? (
          <>
            <ProfileCard
              profile={card.profile}
              onShare={card.share}
              onPressFollowers={card.openFollowers}
              onPressFollowing={card.openFollowing}
            />
            <ProfileStatsSection />
          </>
        ) : card.error ? (
          <View className="gap-3">
            <Callout tone="danger">{card.error}</Callout>
            <RetryButton onPress={card.reload} />
          </View>
        ) : (
          <View
            accessibilityLabel="Carregando perfil"
            className="h-[300px] items-center justify-center rounded-3xl border border-white/[0.06] bg-prisma-surface"
          >
            <ActivityIndicator color={COLORS.accent} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}
