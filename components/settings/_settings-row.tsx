import { Icon, type IconName } from "@/components/ui";
import { usePressed } from "@/hooks";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";

type SettingsRowProps = {
  icon: IconName;
  iconColor: string;
  iconBackground: string;
  title: string;
  subtitle?: string;
  /** Linhas da Zona de perigo usam o vermelho-claro do protótipo. */
  titleColor?: string;
  onPress: () => void;
};

/**
 * Linha da lista agrupada de Configurações (artboard 6d): caixa de ícone 32px,
 * título, subtítulo opcional e chevron. "Sair da conta" e "Excluir conta"
 * compartilham esta forma — só trocam as cores.
 */
export const SettingsRow = memo(
  ({
    icon,
    iconColor,
    iconBackground,
    title,
    subtitle,
    titleColor = "#e5e7eb",
    onPress,
  }: SettingsRowProps) => {
    const { pressed, handlers } = usePressed();

    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        {...handlers}
        className="flex-row items-center gap-3.5 px-4 py-3.5"
        style={{ opacity: pressed ? 0.7 : 1 }}
      >
        <View
          className="h-8 w-8 items-center justify-center rounded-[10px]"
          style={{ backgroundColor: iconBackground }}
        >
          <Icon name={icon} size={14} color={iconColor} />
        </View>

        <View className="min-w-0 flex-1">
          <Text className="text-[15px] font-medium" style={{ color: titleColor }}>
            {title}
          </Text>
          {subtitle ? (
            <Text className="mt-[3px] text-[12px] leading-[17px] text-prisma-faint">
              {subtitle}
            </Text>
          ) : null}
        </View>

        <Icon name="chevronRight" size={12} color="#4b5563" />
      </Pressable>
    );
  },
);

SettingsRow.displayName = "SettingsRow";
