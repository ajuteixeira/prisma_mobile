import { Icon, type IconName } from "@/components/ui";
import { COLORS, PLATFORMS, type PlatformSlug } from "@/constants";
import { memo } from "react";
import { Pressable, ScrollView, Text } from "react-native";

export type RankingFilter = "all" | PlatformSlug;

const OPTIONS: {
  value: RankingFilter;
  label: string;
  icon: IconName;
  color: string;
}[] = [
  { value: "all", label: "Todas", icon: "trophy", color: COLORS.accent },
  ...PLATFORMS.map((platform) => ({
    value: platform.slug,
    label: platform.name,
    icon: platform.icon,
    color: platform.color,
  })),
];

type PlatformFilterProps = {
  value: RankingFilter;
  onChange: (value: RankingFilter) => void;
};

/** Chips de plataforma do ranking, como os filtros da web. */
export const PlatformFilter = memo(
  ({ value, onChange }: PlatformFilterProps) => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2"
    >
      {OPTIONS.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(option.value)}
            className={`h-9 flex-row items-center gap-1.5 rounded-full border px-3.5 ${
              active
                ? "border-prisma-accent/40 bg-prisma-accent/15"
                : "border-white/[0.08] bg-white/[0.04]"
            }`}
          >
            <Icon
              name={option.icon}
              size={14}
              color={active ? option.color : COLORS.faint}
            />
            <Text
              className={`text-[13px] font-semibold ${active ? "text-prisma-ink" : "text-prisma-muted"}`}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  ),
);

PlatformFilter.displayName = "PlatformFilter";
