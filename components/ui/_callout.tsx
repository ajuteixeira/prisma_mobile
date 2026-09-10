import { COLORS } from "@/constants";
import { memo } from "react";
import { Text, View } from "react-native";
import { Icon, type IconName } from "./_icon";

type CalloutTone = "info" | "danger";

const TONES: Record<CalloutTone, { icon: IconName; color: string; container: string; text: string }> = {
  info: {
    icon: "info",
    color: COLORS.accent,
    container: "items-start gap-3 rounded-2xl border border-prisma-info-border bg-prisma-info-bg px-4 py-3.5",
    text: "text-[12.5px] leading-[19px] text-prisma-muted",
  },
  danger: {
    icon: "alert",
    color: COLORS.danger,
    container: "items-center gap-2.5 rounded-[14px] border border-prisma-danger-border bg-prisma-danger-bg px-3.5 py-3",
    text: "text-[12.5px] leading-[19px] text-prisma-danger-text",
  },
};

type CalloutProps = {
  tone?: CalloutTone;
  children: string;
};

/** Caixa de aviso — informativa (azul) ou de erro (vermelha). */
export const Callout = memo(({ tone = "info", children }: CalloutProps) => {
  const style = TONES[tone];

  return (
    <View className={`flex-row ${style.container}`}>
      <Icon name={style.icon} size={14} color={style.color} style={tone === "info" ? { marginTop: 2 } : undefined} />
      <Text className={`flex-1 ${style.text}`}>{children}</Text>
    </View>
  );
});

Callout.displayName = "Callout";
