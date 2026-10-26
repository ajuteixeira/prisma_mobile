import { GameCover, platformOf, ProgressBar } from "@/components/profile";
import { Callout, Icon } from "@/components/ui";
import { COLORS } from "@/constants";
import { useGameAchievements, useProfileGame } from "@/hooks";
import type { GameAchievement, GameAchievementFilter, ProfileGameDetail } from "@/services";
import { completionPercent, formatPlayedDate, formatPlaytime, goBackOr } from "@/utils";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { memo, useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AchievementIcon } from "./_achievement-icon";
import { GameAchievementSheet } from "./_game-achievement-sheet";

const COVER_HEIGHT = 190;

const FILTERS: { id: GameAchievementFilter; label: string; empty: string }[] = [
  { id: "all", label: "Todas", empty: "Nenhuma conquista encontrada para este jogo." },
  { id: "unlocked", label: "Desbloqueadas", empty: "Nenhuma conquista desbloqueada ainda." },
  { id: "locked", label: "Bloqueadas", empty: "Todas as conquistas já foram desbloqueadas." },
];

const SectionLabel = ({ children }: { children: string }) => (
  <Text className="text-[12px] font-semibold text-prisma-muted" style={{ letterSpacing: 1 }}>
    {children}
  </Text>
);

const RetryButton = ({ onPress, label }: { onPress: () => void; label: string }) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={label}
    onPress={onPress}
    className="h-11 items-center justify-center self-start rounded-xl border border-white/[0.08] bg-white/[0.06] px-4"
  >
    <Text className="text-[14px] font-semibold text-prisma-body">Tentar novamente</Text>
  </Pressable>
);

const CloseButton = ({ onPress, top }: { onPress: () => void; top: number }) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel="Fechar"
    onPress={onPress}
    className="absolute right-4 z-10 h-9 flex-row items-center gap-2 rounded-full border border-white/[0.12] px-3.5"
    style={{ top, backgroundColor: "rgba(10, 14, 20, 0.72)" }}
  >
    <Icon name="close" size={13} color={COLORS.ink} />
    <Text className="text-[13px] font-semibold text-prisma-ink">Fechar</Text>
  </Pressable>
);

const Chip = ({
  label,
  icon,
  color = COLORS.muted,
  textColor = "#cbd5e1",
  background = "rgba(255, 255, 255, 0.05)",
  border = "rgba(255, 255, 255, 0.09)",
}: {
  label: string;
  icon: Parameters<typeof Icon>[0]["name"];
  color?: string;
  textColor?: string;
  background?: string;
  border?: string;
}) => (
  <View
    className="h-[30px] flex-row items-center gap-1.5 rounded-full border px-3"
    style={{ backgroundColor: background, borderColor: border }}
  >
    <Icon name={icon} size={11} color={color} />
    <Text className="text-[12.5px] font-semibold" style={{ color: textColor }}>
      {label}
    </Text>
  </View>
);

const dateOrDash = (iso: string | null) => (iso ? (formatPlayedDate(iso) ?? "—") : "—");

/** Capa, ícone, chips, progresso e informações do jogo (artboard 8a). */
const GameHeader = ({ game }: { game: ProfileGameDetail }) => {
  const platform = platformOf(game);
  const percent = completionPercent(game.unlocked_achievements, game.total_achievements);
  const info = [
    ["Plataforma", platform?.name ?? "—"],
    [
      "Tempo de jogo",
      game.playtime_minutes !== null ? formatPlaytime(game.playtime_minutes) : "—",
    ],
    ["Última vez jogado", dateOrDash(game.last_played_at)],
    ["Último desbloqueio", dateOrDash(game.last_unlock_at)],
  ];

  return (
    <>
      <View style={{ height: COVER_HEIGHT }}>
        <GameCover uri={game.cover_url} iconSize={34} style={{ height: COVER_HEIGHT }} />
        <LinearGradient
          pointerEvents="none"
          colors={["rgba(18, 22, 29, 0.2)", "rgba(18, 22, 29, 0.35)", COLORS.surface]}
          locations={[0, 0.45, 1]}
          style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
        />
      </View>

      <View className="-mt-[52px] px-5">
        <View
          className="h-[76px] w-[76px] overflow-hidden rounded-[20px] border-[3px]"
          style={{ borderColor: COLORS.surface, boxShadow: "0px 12px 30px rgba(0, 0, 0, 0.5)" }}
        >
          <GameCover uri={game.icon_url} iconSize={26} style={{ width: 70, height: 70 }} />
        </View>

        <Text
          className="mt-3.5 text-[24px] font-extrabold leading-7 text-prisma-ink"
          style={{ letterSpacing: -0.7 }}
        >
          {game.name}
        </Text>

        <View className="mt-3 flex-row flex-wrap gap-2">
          {platform ? (
            <Chip
              label={platform.name}
              icon={platform.icon}
              color={platform.color}
              textColor={platform.color}
              background={platform.tint}
              border={`${platform.color}4d`}
            />
          ) : null}
          {game.playtime_minutes !== null ? (
            <Chip label={`${formatPlaytime(game.playtime_minutes)} jogadas`} icon="clock" />
          ) : null}
          <Chip label={`${percent}% de conclusão`} icon="pieChart" />
        </View>

        <View className="mt-[18px] rounded-[18px] border border-white/[0.06] bg-white/[0.035] px-4 py-3.5">
          <View className="flex-row items-baseline justify-between gap-2.5">
            <Text className="text-[13px] font-semibold text-prisma-body">
              Progresso de conquistas
            </Text>
            <Text className="text-[13px] text-prisma-muted">
              <Text className="font-bold text-prisma-ink">{game.unlocked_achievements}</Text>
              {` de ${game.total_achievements}`}
            </Text>
          </View>
          <View className="mt-2.5">
            <ProgressBar percent={percent} height={6} fill="gradient" />
          </View>
        </View>

        <View className="mb-3 mt-[26px]">
          <SectionLabel>INFORMAÇÕES DO JOGO</SectionLabel>
        </View>
        <View className="rounded-[18px] border border-white/[0.06] bg-white/[0.035] px-4">
          {info.map(([label, value], index) => (
            <View
              key={label}
              className="min-h-[50px] flex-row items-center justify-between gap-3"
              style={{
                borderBottomWidth: index === info.length - 1 ? 0 : 1,
                borderBottomColor: "rgba(255, 255, 255, 0.06)",
              }}
            >
              <Text className="text-[14px] text-prisma-muted">{label}</Text>
              <Text className="shrink text-right text-[14px] font-semibold text-prisma-ink">
                {value}
              </Text>
            </View>
          ))}
        </View>

        <View className="mb-3 mt-[26px]">
          <SectionLabel>CONQUISTAS</SectionLabel>
          <Text className="mt-1 text-[13px] text-prisma-faint">
            {`${game.unlocked_achievements} desbloqueadas de ${game.total_achievements}`}
          </Text>
        </View>
      </View>
    </>
  );
};

const FilterTabs = ({
  value,
  onChange,
}: {
  value: GameAchievementFilter;
  onChange: (filter: GameAchievementFilter) => void;
}) => (
  <View className="mx-5 mb-3 flex-row gap-1 rounded-[14px] border border-white/[0.07] bg-white/[0.04] p-1">
    {FILTERS.map((filter) => {
      const selected = filter.id === value;
      return (
        <Pressable
          key={filter.id}
          accessibilityRole="button"
          accessibilityState={{ selected }}
          onPress={() => onChange(filter.id)}
          className="h-[34px] flex-1 items-center justify-center rounded-[10px]"
          style={{ backgroundColor: selected ? "rgba(59, 130, 246, 0.18)" : "transparent" }}
        >
          <Text
            className="text-[12.5px] font-semibold"
            style={{ color: selected ? COLORS.accentSoft : COLORS.muted }}
          >
            {filter.label}
          </Text>
        </Pressable>
      );
    })}
  </View>
);

const AchievementRow = memo(
  ({
    achievement,
    onPress,
  }: {
    achievement: GameAchievement;
    onPress: (achievement: GameAchievement) => void;
  }) => {
    const sub = achievement.achieved
      ? achievement.description
      : ["Bloqueada", achievement.description].filter(Boolean).join(" · ");

    return (
      <Pressable
        testID="game-achievement-row"
        accessibilityRole="button"
        accessibilityLabel={`${achievement.name}, ${achievement.achieved ? "desbloqueada" : "bloqueada"}`}
        onPress={() => onPress(achievement)}
        className="mx-5 flex-row items-center gap-3 rounded-2xl border border-white/[0.06] px-3 py-2.5"
        style={{ backgroundColor: "#161b24" }}
      >
        <AchievementIcon achievement={achievement} size={46} radius={13} />
        <View className="min-w-0 flex-1">
          <Text
            numberOfLines={1}
            className="text-[14px] font-bold"
            style={{ color: achievement.achieved ? COLORS.ink : COLORS.muted }}
          >
            {achievement.name}
          </Text>
          {sub ? (
            <Text numberOfLines={1} className="mt-[3px] text-[12px] text-prisma-muted">
              {sub}
            </Text>
          ) : null}
        </View>
        <Icon
          name={achievement.achieved ? "checkCircle" : "lock"}
          size={13}
          color={achievement.achieved ? COLORS.success : "#4b5563"}
        />
      </Pressable>
    );
  },
);

AchievementRow.displayName = "AchievementRow";

const keyOfAchievement = (achievement: GameAchievement) => String(achievement.id);
const RowSeparator = () => <View className="h-2" />;

/** Sem conquistas no jogo (artboard 8b). */
const NoAchievements = () => (
  <View className="mx-5 items-center rounded-[18px] border border-dashed border-white/[0.12] px-5 py-7">
    <Icon name="trophy" size={22} color="#374151" />
    <Text className="mt-2.5 text-center text-[13.5px] text-prisma-muted">
      Nenhuma conquista encontrada para este jogo.
    </Text>
  </View>
);

type GameViewProps = {
  id: number;
  /** Jogo do perfil de outra pessoa. Sem ele, do usuário logado. */
  username?: string;
};

/**
 * Jogo (artboard 8a): capa com o ícone sobreposto, chips, progresso, informações
 * e as conquistas com filtro, carregadas aos poucos ao rolar. Tocar numa
 * conquista abre o detalhe por cima. "Fechar" volta para onde o jogo foi aberto.
 */
export const GameView = ({ id, username }: GameViewProps) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const game = useProfileGame(id, username);
  const [filter, setFilter] = useState<GameAchievementFilter>("all");
  const achievements = useGameAchievements(id, filter, username);
  const [selected, setSelected] = useState<GameAchievement | null>(null);
  const closeDetail = useCallback(() => setSelected(null), []);
  const close = () =>
    goBackOr(router, username ? { pathname: "/user/[username]", params: { username } } : "/profile");

  const renderAchievement = useCallback(
    ({ item }: { item: GameAchievement }) => (
      <AchievementRow achievement={item} onPress={setSelected} />
    ),
    [],
  );

  const detail = game.data;
  const hasAchievements = (detail?.total_achievements ?? 0) > 0;

  if (!detail) {
    return (
      <View className="flex-1 bg-prisma-surface">
        <StatusBar style="light" />
        <CloseButton onPress={close} top={insets.top + 12} />
        <View className="flex-1 justify-center px-5">
          {game.error ? (
            <View className="gap-3">
              <Callout tone="danger">{game.error}</Callout>
              <RetryButton onPress={game.reload} label="Tentar carregar o jogo de novo" />
            </View>
          ) : (
            <View accessibilityLabel="Carregando jogo" className="items-center">
              <ActivityIndicator color={COLORS.accent} />
            </View>
          )}
        </View>
      </View>
    );
  }

  let empty = null;
  if (!hasAchievements) {
    empty = <NoAchievements />;
  } else if (achievements.items) {
    empty = (
      <Text className="mx-5 py-6 text-center text-[13.5px] text-prisma-muted">
        {FILTERS.find((item) => item.id === filter)?.empty}
      </Text>
    );
  } else if (achievements.error) {
    empty = (
      <View className="mx-5 gap-3">
        <Callout tone="danger">{achievements.error}</Callout>
        <RetryButton onPress={achievements.retry} label="Tentar carregar as conquistas de novo" />
      </View>
    );
  } else {
    empty = (
      <View accessibilityLabel="Carregando conquistas" className="items-center py-6">
        <ActivityIndicator color={COLORS.accent} />
      </View>
    );
  }

  let footer = null;
  if (achievements.loadingMore) {
    footer = (
      <View accessibilityLabel="Carregando mais conquistas" className="py-4">
        <ActivityIndicator color={COLORS.accent} />
      </View>
    );
  } else if (achievements.items?.length && achievements.error) {
    footer = (
      <View className="mx-5 mt-3 gap-3">
        <Callout tone="danger">{achievements.error}</Callout>
        <RetryButton onPress={achievements.retry} label="Tentar carregar mais conquistas" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-prisma-surface">
      <StatusBar style="light" />
      <FlatList
        testID="game-achievement-list"
        data={hasAchievements ? (achievements.items ?? []) : []}
        keyExtractor={keyOfAchievement}
        renderItem={renderAchievement}
        ItemSeparatorComponent={RowSeparator}
        ListHeaderComponent={
          <>
            <GameHeader game={detail} />
            {hasAchievements ? <FilterTabs value={filter} onChange={setFilter} /> : null}
          </>
        }
        ListEmptyComponent={empty}
        ListFooterComponent={footer}
        onEndReached={achievements.loadMore}
        onEndReachedThreshold={0.5}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 44 }}
        showsVerticalScrollIndicator={false}
      />
      <CloseButton onPress={close} top={insets.top + 12} />

      <GameAchievementSheet achievement={selected} gameName={detail.name} onClose={closeDetail} />
    </View>
  );
};
