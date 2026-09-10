import { IconButton } from "@/components/ui/_icon-button";
import { PrismaBackground } from "@/components/ui/_prisma-background";
import { SegmentedBar } from "@/components/ui/_segmented-bar";
import { AUTH_HERO_HEIGHT, COLORS, type PrismaBeam } from "@/constants";
import { memo, useMemo } from "react";
import { Platform, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type AuthHeaderProps = {
  title: string;
  subtitle: string;
  onBack?: () => void;
  /** Rótulo monoespaçado ao lado do botão voltar, ex.: "PASSO 2 DE 3". */
  stepLabel?: string;
  /** Uma barra por passo, acesas da primeira até a atual. */
  progress?: { total: number; current: number };
  height?: number;
  /** Feixes do fundo; a tela de vinculação troca por um feixe por plataforma. */
  beams?: PrismaBeam[];
  scrim?: string;
};

/** Topo das telas de autenticação: feixes do prisma, botão voltar e chamada. */
export const AuthHeader = memo(
  ({
    title,
    subtitle,
    onBack,
    stepLabel,
    progress,
    height = AUTH_HERO_HEIGHT,
    beams,
    scrim,
  }: AuthHeaderProps) => {
    const insets = useSafeAreaInsets();

    const segments = useMemo(
      () =>
        progress
          ? Array.from({ length: progress.total }, (_, index) =>
              index < progress.current ? COLORS.brand : COLORS.track,
            )
          : null,
      [progress],
    );

    return (
      <View className="overflow-hidden" style={{ height: height + insets.top }}>
        <PrismaBackground beams={beams} scrim={scrim} />

        <View className="flex-1 px-6" style={{ paddingTop: insets.top }}>
          <View className="h-12 flex-row items-center gap-3.5">
            {onBack ? (
              <IconButton
                icon="back"
                variant="ghost"
                onPress={onBack}
                accessibilityLabel="Voltar"
                className="-ml-2.5"
              />
            ) : null}

            {stepLabel ? (
              <Text
                className="text-[11.5px] font-semibold text-prisma-accent"
                style={{
                  letterSpacing: 2,
                  fontFamily: Platform.select({ ios: "Menlo", default: "monospace" }),
                }}
              >
                {stepLabel}
              </Text>
            ) : null}
          </View>

          {segments ? (
            <View className="mt-1.5">
              <SegmentedBar colors={segments} />
            </View>
          ) : null}

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
  },
);

AuthHeader.displayName = "AuthHeader";
