import { Icon } from "@/components/ui/_icon";
import { COLORS, type Platform } from "@/constants";
import type { PlatformStatus } from "@/hooks/_use-connect-platforms";
import { usePressed } from "@/hooks/_use-pressed";
import { memo } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

type PlatformCardProps = {
  platform: Platform;
  status: PlatformStatus;
  /** Já resolvida entre "Conectado · handle", texto de carregamento e convite. */
  description: string;
  onPress: (platform: Platform) => void;
};

/**
 * Linha de uma plataforma na tela de vinculação: ícone da marca, estado atual e
 * o botão que conecta ou desvincula. Vinculada, a borda e o botão ficam verdes.
 */
export const PlatformCard = memo(
  ({ platform, status, description, onPress }: PlatformCardProps) => {
    const connected = status === "on";
    const loading = status === "loading";
    /** Conectado ou carregando, o botão vira só o ícone, como no protótipo. */
    const iconOnly = connected || loading;

    const { pressed, handlers } = usePressed();

    return (
      <View
        className={`flex-row items-center gap-[13px] rounded-[18px] border bg-prisma-field py-3.5 pl-4 pr-3.5 ${
          connected ? "border-prisma-success-border-soft" : "border-prisma-field-border"
        }`}
      >
        <View
          className="h-11 w-11 items-center justify-center rounded-[13px]"
          style={{ backgroundColor: platform.tint }}
        >
          <Icon name={platform.icon} size={21} color={platform.color} />
        </View>

        <View className="min-w-0 flex-1">
          <Text className="text-[15px] font-bold text-prisma-ink">{platform.name}</Text>
          <Text className="mt-[3px] text-xs text-prisma-muted" numberOfLines={1}>
            {description}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ busy: loading, selected: connected }}
          accessibilityLabel={connected ? `Desvincular ${platform.name}` : `Conectar ${platform.name}`}
          disabled={loading}
          onPress={() => onPress(platform)}
          className={`h-9 flex-row items-center gap-[7px] rounded-[11px] border ${
            iconOnly ? "px-[11px]" : "px-3.5"
          } ${
            connected
              ? "border-prisma-success-border bg-prisma-success-bg"
              : "border-prisma-accent-border bg-prisma-accent-bg"
          }`}
          {...handlers}
          style={{ opacity: pressed ? 0.7 : 1 }}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.accentSoft} />
          ) : (
            <Icon
              name={connected ? "check" : "link"}
              size={12}
              color={connected ? COLORS.success : COLORS.accentSoft}
            />
          )}

          {iconOnly ? null : (
            <Text className="text-[13px] font-semibold text-prisma-accent-soft">Conectar</Text>
          )}
        </Pressable>
      </View>
    );
  },
);

PlatformCard.displayName = "PlatformCard";
