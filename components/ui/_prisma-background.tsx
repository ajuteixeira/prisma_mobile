import { PRISMA_BEAMS, PRISMA_SCRIM, type PrismaBeam } from "@/constants";
import { MotiView } from "moti";
import { memo, useMemo } from "react";
import { View } from "react-native";
import { Easing } from "react-native-reanimated";

/** Quantidade de círculos concêntricos que simulam o desfoque do feixe. */
const LAYERS = 9;

/**
 * O protótipo usa `radial-gradient` + `filter: blur(90px)`, que não existem no
 * React Native. Empilhamos círculos concêntricos translúcidos: cada camada soma
 * um pouco de cor, produzindo o mesmo decaimento suave do centro para a borda.
 */
const Beam = memo(({ rgb, intensity, size, drift, duration, delay, ...position }: PrismaBeam) => {
  const layers = useMemo(() => {
    // Alpha por camada tal que a soma das LAYERS camadas chegue a `intensity`.
    const alpha = 1 - Math.pow(1 - intensity, 1 / LAYERS);
    return Array.from({ length: LAYERS }, (_, index) => {
      const diameter = size * (1 - index / LAYERS);
      return {
        diameter,
        offset: (size - diameter) / 2,
        backgroundColor: `rgba(${rgb}, ${alpha})`,
      };
    });
  }, [rgb, intensity, size]);

  return (
    <MotiView
      pointerEvents="none"
      from={{ translateX: 0, translateY: 0, scale: 1 }}
      animate={{ translateX: drift.x, translateY: drift.y, scale: 1.08 }}
      transition={{
        type: "timing",
        duration,
        delay,
        loop: true,
        repeatReverse: true,
        easing: Easing.inOut(Easing.ease),
      }}
      style={{ position: "absolute", width: size, height: size, ...position }}
    >
      {layers.map((layer, index) => (
        <View
          key={index}
          style={{
            position: "absolute",
            top: layer.offset,
            left: layer.offset,
            width: layer.diameter,
            height: layer.diameter,
            borderRadius: layer.diameter / 2,
            backgroundColor: layer.backgroundColor,
          }}
        />
      ))}
    </MotiView>
  );
});

Beam.displayName = "Beam";

/**
 * Efeito "prisma": os feixes das plataformas se cruzam no topo da tela e são
 * cobertos por um véu escuro para preservar a legibilidade do conteúdo.
 */
export const PrismaBackground = memo(() => (
  <View pointerEvents="none" className="absolute inset-0 overflow-hidden">
    {PRISMA_BEAMS.map((beam) => (
      <Beam key={beam.rgb} {...beam} />
    ))}
    <View className="absolute inset-0" style={{ backgroundColor: PRISMA_SCRIM }} />
  </View>
));

PrismaBackground.displayName = "PrismaBackground";
