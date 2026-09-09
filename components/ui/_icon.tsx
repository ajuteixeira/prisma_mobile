import { COLORS } from "@/constants";
import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { memo } from "react";
import type { StyleProp, ViewStyle } from "react-native";

type SymbolName = Extract<SymbolViewProps["name"], { ios?: unknown }>;

/**
 * Mapa único de ícones da aplicação. `expo-symbols` resolve SF Symbols no iOS e
 * Material Symbols no Android/web, então cada entrada declara os dois nomes.
 */
export const ICONS = {
  back: { ios: "arrow.left", android: "arrow_back", web: "arrow_back" },
  mail: { ios: "envelope.fill", android: "mail", web: "mail" },
  lock: { ios: "lock.fill", android: "lock", web: "lock" },
  eye: { ios: "eye.fill", android: "visibility", web: "visibility" },
  eyeOff: { ios: "eye.slash.fill", android: "visibility_off", web: "visibility_off" },
  check: { ios: "checkmark", android: "check", web: "check" },
  checkCircle: { ios: "checkmark.circle.fill", android: "check_circle", web: "check_circle" },
  info: { ios: "info.circle.fill", android: "info", web: "info" },
  alert: { ios: "exclamationmark.circle.fill", android: "error", web: "error" },
} as const satisfies Record<string, SymbolName>;

export type IconName = keyof typeof ICONS;

type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
};

export const Icon = memo(({ name, size = 16, color = COLORS.accent, style }: IconProps) => (
  <SymbolView
    name={ICONS[name]}
    size={size}
    tintColor={color}
    resizeMode="scaleAspectFit"
    style={[{ width: size, height: size }, style]}
  />
));

Icon.displayName = "Icon";
