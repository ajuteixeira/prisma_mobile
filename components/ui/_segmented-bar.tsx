import { MotiView } from "moti";
import { memo } from "react";
import { View } from "react-native";

type SegmentedBarProps = {
  /** Uma cor por segmento, já resolvida entre aceso e apagado. */
  colors: readonly string[];
  /** Largura fixa de cada segmento; sem ela os segmentos dividem a linha. */
  segmentWidth?: number;
  gap?: number;
  height?: number;
};

/**
 * Barra dividida em segmentos, usada no progresso do cadastro, na régua de
 * força da senha e no contador de contas vinculadas.
 */
export const SegmentedBar = memo(
  ({ colors, segmentWidth, gap = 6, height = 4 }: SegmentedBarProps) => (
    <View className="flex-row" style={{ gap }}>
      {colors.map((color, index) => (
        <MotiView
          key={index}
          animate={{ backgroundColor: color }}
          transition={{ type: "timing", duration: 220 }}
          style={{
            flex: segmentWidth ? undefined : 1,
            width: segmentWidth,
            height,
            borderRadius: height / 2,
          }}
        />
      ))}
    </View>
  ),
);

SegmentedBar.displayName = "SegmentedBar";
