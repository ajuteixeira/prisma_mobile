import { Icon, type IconName } from "@/components/ui";
import { BRAND_GRADIENT, COLORS, PLATFORMS } from "@/constants";
import type { RecentGame } from "@/services";
import { completionPercent, formatPlayedDate, formatPlaytime } from "@/utils";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { memo, useState } from "react";
import { Pressable, Text, View } from "react-native";

/** Fundo das capas enquanto carregam ou quando não existem. */
const COVER_BACKGROUND = "#1b2230";

/** Barra do destaque: do azul da marca ao azul claro, como no protótipo. */
const PROGRESS_GRADIENT = [BRAND_GRADIENT[0], COLORS.accent] as const;

type PlatformBadge = { name: string; icon: IconName; color: string };

/** Ícone e cor do catálogo do app; plataformas desconhecidas ficam com o nome da API. */
const platformOf = (game: RecentGame): PlatformBadge | null => {
  if (!game.platform) return null;
  const known = PLATFORMS.find((platform) => platform.slug === game.platform?.slug);
  return known
    ? { name: known.name, icon: known.icon, color: known.color }
    : { name: game.platform.name, icon: "gamepad", color: COLORS.muted };
};

/** Capa do jogo; sem URL (ou se a imagem falhar) fica o controle sobre o fundo neutro. */
const Cover = ({
  uri,
  iconSize,
  style,
}: {
  uri: string | null;
  iconSize: number;
  style: object;
}) => {
  const [broken, setBroken] = useState(false);

  return (
    <View
      className="items-center justify-center overflow-hidden"
      style={[{ backgroundColor: COVER_BACKGROUND }, style]}
    >
      {uri && !broken ? (
        <Image
          testID="recent-game-cover"
          source={{ uri }}
          style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
          contentFit="cover"
          transition={150}
          onError={() => setBroken(true)}
        />
      ) : (
        <View testID="recent-game-cover-fallback">
          <Icon name="gamepad" size={iconSize} color={COLORS.faint} />
        </View>
      )}
    </View>
  );
};

const ProgressBar = ({
  percent,
  height,
  fill,
}: {
  percent: number;
  height: number;
  fill: "gradient" | string;
}) => (
  <View className="overflow-hidden rounded-full bg-white/[0.08]" style={{ height }}>
    <View
      testID="recent-game-progress"
      className="h-full overflow-hidden rounded-full"
      style={{ width: `${percent}%` }}
    >
      {fill === "gradient" ? (
        <LinearGradient
          colors={PROGRESS_GRADIENT}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        />
      ) : (
        <View className="flex-1" style={{ backgroundColor: fill }} />
      )}
    </View>
  </View>
);

/**
 * "Jogado recentemente" (artboard 6a): capa com o selo da plataforma, horas e
 * data da última sessão e o progresso das conquistas. Horas e data somem quando
 * a API não as informa.
 */
export const RecentlyPlayedCard = memo(({ game }: { game: RecentGame }) => {
  const platform = platformOf(game);
  const playedOn = game.last_played_at ? formatPlayedDate(game.last_played_at) : null;
  const meta = [
    game.playtime_minutes !== null ? `${formatPlaytime(game.playtime_minutes)} registradas` : null,
    playedOn ? `jogado em ${playedOn}` : null,
  ].filter(Boolean);
  const percent = completionPercent(game.unlocked_achievements, game.total_achievements);

  return (
    <View
      testID="recently-played-card"
      className="overflow-hidden rounded-[22px] border border-white/[0.06] bg-prisma-surface"
    >
      <View className="h-[130px]">
        <Cover uri={game.cover_url} iconSize={32} style={{ height: 130 }} />
        <LinearGradient
          pointerEvents="none"
          colors={["rgba(18, 22, 29, 0)", COLORS.surface]}
          locations={[0.3, 1]}
          style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
        />
        {platform ? (
          <View
            className="absolute left-3 top-3 h-[26px] flex-row items-center gap-1.5 rounded-full px-2.5"
            style={{ backgroundColor: "rgba(10, 14, 20, 0.7)" }}
          >
            <Icon name={platform.icon} size={11} color={platform.color} />
            <Text className="text-[11px] font-semibold text-prisma-body">{platform.name}</Text>
          </View>
        ) : null}
      </View>

      <View className="-mt-[18px] px-4 pb-4">
        <Text numberOfLines={2} className="text-[17px] font-bold text-prisma-ink">
          {game.name}
        </Text>
        {meta.length > 0 ? (
          <Text className="mt-1 text-[12.5px] text-prisma-muted">{meta.join(" · ")}</Text>
        ) : null}

        {game.total_achievements > 0 ? (
          <>
            <View className="mt-3.5 flex-row items-center justify-between">
              <Text className="text-[12px] text-prisma-muted">Conquistas</Text>
              <Text className="text-[12px] font-semibold text-prisma-body">
                {`${game.unlocked_achievements} de ${game.total_achievements} · ${percent}%`}
              </Text>
            </View>
            <View className="mt-2">
              <ProgressBar percent={percent} height={6} fill="gradient" />
            </View>
          </>
        ) : (
          <Text className="mt-3.5 text-[12px] text-prisma-faint">Este jogo não tem conquistas</Text>
        )}
      </View>
    </View>
  );
});

RecentlyPlayedCard.displayName = "RecentlyPlayedCard";

const RecentGameRow = memo(({ game }: { game: RecentGame }) => {
  const platform = platformOf(game);
  const percent = completionPercent(game.unlocked_achievements, game.total_achievements);
  const color = percent >= 100 ? COLORS.success : COLORS.accent;
  const meta = [
    game.total_achievements > 0
      ? `${game.unlocked_achievements}/${game.total_achievements} conquistas`
      : "Sem conquistas",
    game.playtime_minutes !== null ? formatPlaytime(game.playtime_minutes) : null,
    platform?.name,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <View
      testID="recent-game-row"
      accessible
      accessibilityLabel={`${game.name}, ${percent}%, ${meta}`}
      className="flex-row items-center gap-[13px] rounded-[18px] border border-white/[0.06] bg-prisma-surface p-3"
    >
      <Cover
        uri={game.cover_url}
        iconSize={20}
        style={{ width: 52, height: 52, borderRadius: 13 }}
      />
      <View className="min-w-0 flex-1">
        <View className="flex-row items-center justify-between gap-2">
          <Text numberOfLines={1} className="min-w-0 flex-1 text-[15px] font-bold text-prisma-ink">
            {game.name}
          </Text>
          <Text className="text-[13px] font-bold" style={{ color }}>
            {`${percent}%`}
          </Text>
        </View>
        <Text numberOfLines={1} className="mt-[3px] text-[12px] text-prisma-muted">
          {meta}
        </Text>
        <View className="mt-2">
          <ProgressBar
            percent={percent}
            height={5}
            fill={percent >= 100 ? COLORS.success : BRAND_GRADIENT[0]}
          />
        </View>
      </View>
    </View>
  );
});

RecentGameRow.displayName = "RecentGameRow";

/** "Jogos recentes" (artboard 6a): uma linha por jogo, com % e resumo das conquistas. */
export const RecentGamesList = memo(({ games }: { games: RecentGame[] }) => (
  <View className="gap-2.5">
    {games.map((game) => (
      <RecentGameRow key={game.id} game={game} />
    ))}
  </View>
));

RecentGamesList.displayName = "RecentGamesList";

/** Ocupa o lugar do destaque enquanto nenhuma plataforma trouxe jogos. */
export const RecentlyPlayedEmpty = memo(({ onConnect }: { onConnect: () => void }) => (
  <View className="items-center rounded-[22px] border border-dashed border-white/[0.12] px-5 py-7">
    <Icon name="gamepad" size={22} color="#374151" />
    <Text className="mt-2.5 text-[15px] font-bold text-prisma-ink">Nenhum jogo por aqui ainda</Text>
    <Text className="mt-1 text-center text-[13.5px] leading-5 text-prisma-muted">
      Vincule uma plataforma para ver seus jogos recentes.
    </Text>
    <Pressable
      accessibilityRole="button"
      onPress={onConnect}
      className="mt-4 h-11 flex-row items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.06] px-4"
    >
      <Icon name="link" size={14} color={COLORS.accent} />
      <Text className="text-[14px] font-semibold text-prisma-body">Conectar plataformas</Text>
    </Pressable>
  </View>
));

RecentlyPlayedEmpty.displayName = "RecentlyPlayedEmpty";
