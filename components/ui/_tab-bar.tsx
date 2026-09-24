import { Icon, type IconName } from "@/components/ui/_icon";
import { COLORS } from "@/constants";
import { usePressed } from "@/hooks/_use-pressed";
import type { BottomTabBarProps } from "expo-router/build/react-navigation/bottom-tabs";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Mesma ordem e ícones da sidebar do protótipo web (perfil → ranking →
 * seguidores → ajustes), numa pill flutuante como no artboard 6d. A cor ativa
 * é o azul de destaque; as demais ficam em cinza.
 */
const TABS: Record<string, { icon: IconName; label: string }> = {
  profile: { icon: "user", label: "Perfil" },
  ranking: { icon: "trophy", label: "Ranking" },
  followers: { icon: "users", label: "Seguidores" },
  settings: { icon: "settings", label: "Ajustes" },
};

const TabItem = memo(
  ({
    icon,
    label,
    active,
    onPress,
    onLongPress,
  }: {
    icon: IconName;
    label: string;
    active: boolean;
    onPress: () => void;
    onLongPress: () => void;
  }) => {
    const { pressed, handlers } = usePressed();
    const color = active ? COLORS.accent : COLORS.faint;

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        accessibilityLabel={label}
        onPress={onPress}
        onLongPress={onLongPress}
        {...handlers}
        className="flex-1 items-center justify-center gap-[5px]"
        style={{ opacity: pressed ? 0.7 : 1 }}
      >
        <Icon name={icon} size={18} color={color} />
        <Text className="text-[10.5px] font-semibold" style={{ color }}>
          {label}
        </Text>
      </Pressable>
    );
  },
);

TabItem.displayName = "TabItem";

export const PrismaTabBar = memo(({ state, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();

  return (
    // Posição absoluta dentro do container da tab bar: a pill flutua sobre o
    // conteúdo da tela, com a margem inferior seguindo a safe area.
    <View
      pointerEvents="box-none"
      className="absolute left-3.5 right-3.5 h-[66px] flex-row overflow-hidden rounded-3xl border border-white/10"
      style={{
        bottom: Math.max(insets.bottom, 12) + 14,
        backgroundColor: "rgba(18, 22, 29, 0.88)",
        boxShadow: "0px 14px 40px rgba(0, 0, 0, 0.5)",
      }}
    >
      {state.routes.map((route, index) => {
        const tab = TABS[route.name] ?? { icon: "user" as IconName, label: route.name };
        const active = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!active && !event.defaultPrevented) navigation.navigate(route.name);
        };

        return (
          <TabItem
            key={route.key}
            icon={tab.icon}
            label={tab.label}
            active={active}
            onPress={onPress}
            onLongPress={() => navigation.emit({ type: "tabLongPress", target: route.key })}
          />
        );
      })}
    </View>
  );
});

PrismaTabBar.displayName = "PrismaTabBar";
