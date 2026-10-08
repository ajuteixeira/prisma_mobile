import { Icon, type IconName } from "@/components/ui";
import { COLORS, PLATFORMS, type PlatformSlug } from "@/constants";
import type { PlatformShare, ProfileStats } from "@/services";
import { formatCount } from "@/utils";
import { memo } from "react";
import { Text, View } from "react-native";

/** Cor de cada plataforma na barra (as mesmas dos feixes); a legenda usa `Platform.color`. */
const BAR_COLORS: Record<PlatformSlug, string> = {
  steam: "#66c0f4",
  playstation: "#0070cc",
  xbox: "#107c10",
  retroachievements: "#d4a017",
};

/** Como a web: inteiro quando não há decimal (60.0 → "60"), senão uma casa ("33,3"). */
const formatPercent = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(1).replace(".", ",");

const SectionLabel = ({ children }: { children: string }) => (
  <Text className="mb-3 text-[12px] font-semibold text-prisma-muted" style={{ letterSpacing: 1 }}>
    {children}
  </Text>
);

const Stat = memo(
  ({
    icon,
    color,
    value,
    label,
  }: {
    icon: IconName;
    color: string;
    value: string;
    label: string;
  }) => (
    <View
      accessible
      accessibilityLabel={`${value} ${label.toLowerCase()}`}
      className="min-w-0 flex-1 items-center gap-1.5"
    >
      <Icon name={icon} size={14} color={color} />
      <Text
        className="text-[20px] font-extrabold leading-[22px] text-prisma-ink"
        style={{ letterSpacing: -0.4 }}
      >
        {value}
      </Text>
      <Text numberOfLines={1} className="text-center text-[11.5px] text-prisma-muted">
        {label}
      </Text>
    </View>
  ),
);

Stat.displayName = "Stat";

/**
 * Os três números do Perfil (artboard 6a). A média de conclusão é truncada,
 * como na web: 34,8% aparece como 34%.
 */
export const ProfileStatsCard = memo(({ stats }: { stats: ProfileStats }) => (
  <View className="flex-row gap-2 rounded-[20px] border border-white/[0.06] bg-prisma-surface px-3 py-[18px]">
    <Stat
      icon="trophy"
      color="#d4a017"
      value={formatCount(stats.total_achievements)}
      label="Conquistas"
    />
    <Stat
      icon="pieChart"
      color={COLORS.accent}
      value={`${Math.trunc(stats.avg_completion)}%`}
      label="Média conclusão"
    />
    <Stat
      icon="crown"
      color={COLORS.success}
      value={formatCount(stats.perfect_games)}
      label="Jogos perfeitos"
    />
  </View>
));

ProfileStatsCard.displayName = "ProfileStatsCard";

/**
 * "Troféus por plataforma" (artboard 6a): barra segmentada e legenda com as
 * quatro plataformas do app, sempre na mesma ordem. Plataforma ausente na
 * resposta conta como 0%; slugs que o app não conhece ficam de fora.
 */
export const PlatformDistributionCard = memo(
  ({ distribution }: { distribution: PlatformShare[] }) => {
    const bySlug = new Map(distribution.map((share) => [share.slug, share.percentage]));
    const shares = PLATFORMS.map((platform) => ({
      platform,
      percentage: bySlug.get(platform.slug) ?? 0,
    }));

    return (
      <View className="rounded-[20px] border border-white/[0.06] bg-prisma-surface p-4">
        <SectionLabel>TROFÉUS POR PLATAFORMA</SectionLabel>

        <View className="h-2.5 flex-row gap-0.5 overflow-hidden rounded-full bg-white/[0.08]">
          {shares
            .filter(({ percentage }) => percentage > 0)
            .map(({ platform, percentage }) => (
              <View
                key={platform.slug}
                testID="platform-share-segment"
                style={{
                  flexGrow: percentage,
                  flexBasis: 0,
                  backgroundColor: BAR_COLORS[platform.slug],
                }}
              />
            ))}
        </View>

        <View className="mt-3 flex-row gap-1.5">
          {shares.map(({ platform, percentage }) => (
            <View
              key={platform.slug}
              testID="platform-share"
              accessible
              accessibilityLabel={`${platform.name}: ${formatPercent(percentage)}%`}
              className="min-w-0 flex-1 flex-row items-center gap-1.5"
            >
              <Icon name={platform.icon} size={13} color={platform.color} />
              <Text numberOfLines={1} className="text-[12.5px] font-bold text-prisma-body">
                {formatPercent(percentage)}%
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  },
);

PlatformDistributionCard.displayName = "PlatformDistributionCard";
