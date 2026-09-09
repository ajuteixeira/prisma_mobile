import { PrismaBackground } from "@/components/ui/_prisma-background";
import { IconButton } from "@/components/ui/_icon-button";
import { AUTH_HERO_HEIGHT } from "@/constants";
import { memo } from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type AuthHeaderProps = {
  title: string;
  subtitle: string;
  onBack?: () => void;
};

/** Topo das telas de autenticação: feixes do prisma, botão voltar e chamada. */
export const AuthHeader = memo(({ title, subtitle, onBack }: AuthHeaderProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View className="overflow-hidden" style={{ height: AUTH_HERO_HEIGHT + insets.top }}>
      <PrismaBackground />

      <View className="flex-1 px-6" style={{ paddingTop: insets.top }}>
        <View className="h-12 flex-row items-center">
          {onBack ? (
            <IconButton
              icon="back"
              variant="ghost"
              onPress={onBack}
              accessibilityLabel="Voltar"
              className="-ml-2.5"
            />
          ) : null}
        </View>

        <View className="flex-1 justify-center pb-2">
          <Text
            className="text-[30px] font-extrabold leading-[33px] text-prisma-ink"
            style={{ letterSpacing: -1.2 }}
          >
            {title}
          </Text>
          <Text className="mt-2 text-[13.5px] leading-5 text-prisma-muted">{subtitle}</Text>
        </View>
      </View>
    </View>
  );
});

AuthHeader.displayName = "AuthHeader";
