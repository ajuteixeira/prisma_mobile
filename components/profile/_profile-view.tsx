import { Callout, PrismaBackground } from "@/components/ui";
import { COLORS, PROFILE_BEAMS, PROFILE_HERO_HEIGHT } from "@/constants";
import { useProfile, useProfileGames, useProfileStats } from "@/hooks";
import { profileApi, type ProfileGame } from "@/services";
import { openGame } from "@/utils";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter, useScrollToTop } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useRef, useState, type ReactNode } from "react";
import { ActivityIndicator, FlatList, Pressable, Share, Text, View } from "react-native";
import { AchievementDetailDialog } from "./_achievement-detail-dialog";
import { PinAchievementsSheet } from "./_pin-achievements-sheet";
import { ProfileCard } from "./_profile-card";
import { PlatformDistributionCard, ProfileStatsCard } from "./_profile-stats";
import { GameRow, RecentlyPlayedCard, RecentlyPlayedEmpty } from "./_recently-played";

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
const ProfileStatsSection = ({ username }: { username?: string }) => {
  const { data, loading, error, reload } = useProfileStats(username);

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

type ProfileGames = ReturnType<typeof useProfileGames>;

const keyOfGame = (game: ProfileGame) => String(game.id);
const GameSeparator = () => <View className="h-2.5" />;

/**
 * Seções abaixo do cartão. A mesma lista de jogos alimenta o destaque ("Jogado
 * recentemente", o 1º jogo) e a lista "Jogos", que vem depois das estatísticas
 * com todos os jogos, inclusive o do destaque, e é renderizada pelo `FlatList`.
 */
const ProfileSections = ({
  username,
  games,
  onOpenGame,
}: {
  username?: string;
  games: ProfileGames;
  onOpenGame: (game: ProfileGame) => void;
}) => {
  const router = useRouter();
  const latest = games.items?.[0];

  let recentlyPlayed = null;
  if (latest) {
    recentlyPlayed = <RecentlyPlayedCard game={latest} onPress={onOpenGame} />;
  } else if (games.items) {
    recentlyPlayed = (
      <RecentlyPlayedEmpty
        onConnect={username ? undefined : () => router.push("/connect-platforms")}
      />
    );
  } else if (games.error) {
    recentlyPlayed = (
      <View className="gap-3">
        <Callout tone="danger">{games.error}</Callout>
        <RetryButton onPress={games.retry} label="Tentar carregar os jogos de novo" />
      </View>
    );
  } else if (games.loading) {
    recentlyPlayed = (
      <View
        accessibilityLabel="Carregando jogos"
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

      <ProfileStatsSection username={username} />

      {latest ? <SectionLabel>JOGOS</SectionLabel> : null}
    </>
  );
};

/** Fim da lista "Jogos": carregando a próxima página ou o erro dela. */
const GamesFooter = ({ games }: { games: ProfileGames }) => {
  if (games.loadingMore) {
    return (
      <View accessibilityLabel="Carregando mais jogos" className="py-4">
        <ActivityIndicator color={COLORS.accent} />
      </View>
    );
  }

  if (games.items?.length && games.error) {
    return (
      <View className="mt-3 gap-3">
        <Callout tone="danger">{games.error}</Callout>
        <RetryButton onPress={games.retry} label="Tentar carregar mais jogos" />
      </View>
    );
  }

  return null;
};

const shareProfile = (username: string, own: boolean) => {
  const url = profileApi.publicUrl(username);
  const message = own
    ? `Veja minhas conquistas no Prisma: ${url}`
    : `Veja as conquistas de @${username} no Prisma: ${url}`;
  Share.share({ message, url }).catch(() => undefined);
};

type ProfileViewProps = {
  /** Perfil de outra pessoa, só leitura. Sem ele, o do usuário logado. */
  username?: string;
  /** Conteúdo acima do cartão, dentro da rolagem. */
  header?: ReactNode;
};

/**
 * Perfil (artboard 6a): cartão, jogado recentemente, estatísticas, troféus por
 * plataforma e todos os jogos, carregados aos poucos ao rolar. No próprio perfil, seguidores/seguindo abrem a
 * aba Seguidores, as conquistas fixadas abrem detalhes e pinagem e o estado
 * vazio oferece vincular plataformas.
 */
export const ProfileView = ({ username, header }: ProfileViewProps) => {
  const router = useRouter();
  const own = !username;
  const { data: profile, error, reload } = useProfile(username);
  const games = useProfileGames(username);
  const openGameScreen = useCallback(
    (game: ProfileGame) => openGame(router, game.id, username),
    [router, username],
  );
  const renderGame = useCallback(
    ({ item }: { item: ProfileGame }) => <GameRow game={item} onPress={openGameScreen} />,
    [openGameScreen],
  );
  const listRef = useRef<FlatList<ProfileGame>>(null);
  // Tocar no ícone Perfil com a aba já aberta rola até o topo...
  useScrollToTop(listRef);
  // ...e o perfil sempre abre no topo, mesmo vindo de outra aba.
  useFocusEffect(
    useCallback(() => {
      listRef.current?.scrollToOffset({ offset: 0, animated: false });
    }, []),
  );
  // TODO: abrir já na aba "Seguindo" quando a tela de Seguidores existir (artboard 6c).
  const openFollowers = own ? () => router.push("/followers") : undefined;
  const [pinning, setPinning] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const closeDetail = useCallback(() => setDetailId(null), []);
  const closePins = useCallback(() => setPinning(false), []);
  const onPinsSaved = useCallback(() => {
    setPinning(false);
    reload();
  }, [reload]);

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

      <FlatList
        ref={listRef}
        testID="profile-list"
        data={profile ? (games.items ?? []) : []}
        keyExtractor={keyOfGame}
        renderItem={renderGame}
        ItemSeparatorComponent={GameSeparator}
        ListHeaderComponent={
          <>
            {header}
            {profile ? (
              <>
                <ProfileCard
                  profile={profile}
                  online={own}
                  onShare={() => shareProfile(profile.username, own)}
                  onPressFollowers={openFollowers}
                  onPressFollowing={openFollowers}
                  // Detalhe e pinagem usam `/api/profile/achievements`, que só cobre o usuário logado.
                  onManagePins={own ? () => setPinning(true) : undefined}
                  onPressAchievement={own ? (achievement) => setDetailId(achievement.id) : undefined}
                />
                <ProfileSections username={username} games={games} onOpenGame={openGameScreen} />
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
          </>
        }
        ListFooterComponent={profile ? <GamesFooter games={games} /> : null}
        onEndReached={games.loadMore}
        onEndReachedThreshold={0.5}
        className="flex-1"
        contentContainerClassName={`px-5 pb-[120px] ${header ? "pt-[52px]" : "pt-[64px]"}`}
        showsVerticalScrollIndicator={false}
      />

      {own && profile ? (
        <PinAchievementsSheet
          visible={pinning}
          pinned={profile.pinned_achievements}
          onClose={closePins}
          onSaved={onPinsSaved}
        />
      ) : null}

      {own ? <AchievementDetailDialog achievementId={detailId} onClose={closeDetail} /> : null}
    </View>
  );
};
