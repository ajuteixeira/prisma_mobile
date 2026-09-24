import { PrismaBackground } from "@/components/ui/_prisma-background";
import { LOGIN_BEAMS, LOGIN_HERO_HEIGHT, PRISMA_LOGO_COLORS } from "@/constants";
import { MotiView } from "moti";
import { memo } from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const LOGO = "PRISMA";

/** Topo do login: os quatro feixes do prisma e o logotipo com o slogan. */
export const LoginHero = memo(() => {
  const insets = useSafeAreaInsets();

  return (
    <View className="overflow-hidden" style={{ height: LOGIN_HERO_HEIGHT + insets.top }}>
      <PrismaBackground beams={LOGIN_BEAMS} />

      <MotiView
        from={{ opacity: 0, translateY: 12 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 600 }}
        className="flex-1 items-center justify-center px-7"
        style={{ paddingTop: insets.top }}
      >
        <Text
          accessibilityRole="header"
          accessibilityLabel="Prisma"
          className="text-[52px] font-black"
          style={{ letterSpacing: -2.4 }}
        >
          {LOGO.split("").map((letter, index) => (
            <Text key={index} style={{ color: PRISMA_LOGO_COLORS[index] }}>
              {letter}
            </Text>
          ))}
        </Text>
        <Text className="mt-2.5 text-center text-[13.5px] text-prisma-muted" style={{ letterSpacing: 0.2 }}>
          Unifique suas conquistas em um só lugar
        </Text>
      </MotiView>
    </View>
  );
});

LoginHero.displayName = "LoginHero";
