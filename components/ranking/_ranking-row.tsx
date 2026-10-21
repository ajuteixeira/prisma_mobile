import { Icon, SpectrumAvatar } from "@/components/ui";
import { COLORS, PLATFORMS } from "@/constants";
import { usePressed } from "@/hooks/_use-pressed";
import type { RankingEntry } from "@/services";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";

/** Ouro, prata e bronze; do 4º em diante, neutro. */
const MEDALS = ["#d4a017", "#c0c7d1", "#cd7f32"] as const;

type RankingRowProps = {
  entry: RankingEntry;
  position: number;
  /** Conquistas exibidas: o total ou só a plataforma filtrada. */
  count: number;
  onPress: (entry: RankingEntry) => void;
};

/** Linha do ranking: posição, avatar, nome, plataformas e conquistas. Tocável por inteiro. */
export const RankingRow = memo(
  ({ entry, position, count, onPress }: RankingRowProps) => {
    const { pressed, handlers } = usePressed();
    const medal = MEDALS[position - 1];
    const platforms = PLATFORMS.filter((platform) =>
      entry.platforms.includes(platform.slug),
    );

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${position}º, ${entry.username}, ${count} conquistas`}
        accessibilityHint="Abre o perfil"
        onPress={() => onPress(entry)}
        {...handlers}
        style={{ opacity: pressed ? 0.6 : 1 }}
        className={`flex-row items-center gap-3 rounded-[18px] border px-3.5 py-3 ${
          entry.is_current_user
            ? "border-prisma-accent/30 bg-prisma-accent/[0.08]"
            : "border-white/[0.06] bg-prisma-surface"
        }`}
      >
        <View
          className="h-8 w-8 items-center justify-center rounded-full"
          style={{
            backgroundColor: medal ? `${medal}26` : "rgba(255, 255, 255, 0.06)",
          }}
        >
          <Text
            className="text-[13px] font-bold"
            style={{ color: medal ?? COLORS.muted }}
          >
            {position}º
          </Text>
        </View>

        <SpectrumAvatar
          username={entry.username}
          uri={entry.avatar_url}
          size={44}
        />

        <View className="min-w-0 flex-1">
          <Text
            numberOfLines={1}
            className={`text-[15px] font-semibold ${
              entry.is_current_user ? "text-prisma-accent" : "text-prisma-ink"
            }`}
          >
            {entry.username}
            {entry.is_current_user ? (
              <Text className="text-[12px] font-normal text-prisma-faint">
                {" "}
                (você)
              </Text>
            ) : null}
          </Text>
          {platforms.length > 0 ? (
            <View className="mt-1 flex-row gap-1.5">
              {platforms.map((platform) => (
                <View
                  key={platform.slug}
                  accessibilityLabel={platform.name}
                  className="h-5 w-5 items-center justify-center rounded-md"
                  style={{ backgroundColor: platform.tint }}
                >
                  <Icon name={platform.icon} size={11} color={platform.color} />
                </View>
              ))}
            </View>
          ) : null}
        </View>

        <View className="items-end">
          <Text className="text-[17px] font-bold text-prisma-ink">{count}</Text>
          <Text className="text-[11px] text-prisma-faint">conquistas</Text>
        </View>
      </Pressable>
    );
  },
);

RankingRow.displayName = "RankingRow";
