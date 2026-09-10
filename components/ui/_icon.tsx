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
  user: { ios: "person.fill", android: "person", web: "person" },
  at: { ios: "at", android: "alternate_email", web: "alternate_email" },
  shield: { ios: "checkmark.shield.fill", android: "shield", web: "shield" },
  link: { ios: "link", android: "link", web: "link" },
  close: { ios: "xmark", android: "close", web: "close" },
  copy: { ios: "doc.on.doc.fill", android: "content_copy", web: "content_copy" },
  trophy: { ios: "trophy.fill", android: "emoji_events", web: "emoji_events" },
  gamepad: { ios: "gamecontroller.fill", android: "sports_esports", web: "sports_esports" },
  joystick: { ios: "arcade.stick", android: "videogame_asset", web: "videogame_asset" },
  console: { ios: "gamecontroller", android: "stadia_controller", web: "stadia_controller" },
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
