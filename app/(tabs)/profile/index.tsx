import {
  PlatformDistributionCard,
  ProfileCard,
  ProfileStatsCard,
  RecentGamesList,
  RecentlyPlayedCard,
  RecentlyPlayedEmpty,
} from "@/components/profile";
import { Callout, PrismaBackground } from "@/components/ui";
import { COLORS, PROFILE_BEAMS, PROFILE_HERO_HEIGHT } from "@/constants";
import { useProfile, useProfileStats, useRecentlyPlayed } from "@/hooks";
import { profileApi } from "@/services";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Pressable, ScrollView, Share, Text, View } from "react-native";

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

const SectionLabel = ({ children }: { children: string }) => (
  <Text
    className="mb-3 mt-[26px] text-[12px] font-semibold text-prisma-muted"
    style={{ letterSpacing: 1 }}
  >
    {children}
  </Text>
);

/**
 * Seções abaixo do cartão. Uma única busca alimenta o destaque ("Jogado
 * recentemente", 1º jogo) e a lista ("Jogos recentes", do 2º ao 4º), que fica
 * depois das estatísticas e só aparece quando há mais de um jogo.
 */
const ProfileSections = () => {
  const router = useRouter();
  const { data, loading, error, reload } = useRecentlyPlayed();
  const [latest, ...others] = data?.games ?? [];

  let recentlyPlayed = null;
  if (latest) {
    recentlyPlayed = <RecentlyPlayedCard game={latest} />;
  } else if (data) {
    recentlyPlayed = <RecentlyPlayedEmpty onConnect={() => router.push("/connect-platforms")} />;
  } else if (error) {
    recentlyPlayed = (
      <View className="gap-3">
        <Callout tone="danger">{error}</Callout>
        <RetryButton onPress={reload} label="Tentar carregar os jogos recentes de novo" />
      </View>
    );
  } else if (loading) {
    recentlyPlayed = (
      <View
        accessibilityLabel="Carregando jogos recentes"
        className="h-[200px] items-center justify-center rounded-[22px] border border-white/[0.06] bg-prisma-surface"
      >
        <ActivityIndicator color={COLORS.accent} />
      </View>
    );
  }

  return (
    <>
      {recentlyPlayed ? (
        <>
          <SectionLabel>JOGADO RECENTEMENTE</SectionLabel>
          {recentlyPlayed}
        </>
      ) : null}

      <ProfileStatsSection />

      {others.length > 0 ? (
        <>
          <SectionLabel>JOGOS RECENTES</SectionLabel>
          <RecentGamesList games={others} />
        </>
      ) : null}
    </>
  );
};

const shareProfile = (username: string) => {
  const url = profileApi.publicUrl(username);
  Share.share({ message: `Veja minhas conquistas no Prisma: ${url}`, url }).catch(() => undefined);
};

/**
 * Perfil (artboard 6a), primeira aba após o login: cartão de perfil, jogado
 * recentemente, estatísticas, troféus por plataforma e jogos recentes.
 */
export default function ProfileScreen() {
  const router = useRouter();
  const { data: profile, error, reload } = useProfile();
  // TODO: abrir já na aba "Seguindo" quando a tela de Seguidores existir (artboard 6c).
  const openFollowers = () => router.push("/followers");

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
        {profile ? (
          <>
            <ProfileCard
              profile={profile}
              onShare={() => shareProfile(profile.username)}
              onPressFollowers={openFollowers}
              onPressFollowing={openFollowers}
            />
            <ProfileSections />
          </>
        ) : error ? (
          <View className="gap-3">
            <Callout tone="danger">{error}</Callout>
            <RetryButton onPress={reload} />
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
