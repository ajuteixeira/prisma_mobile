import type { PropsWithChildren } from "react";
import { Platform, useWindowDimensions, View } from "react-native";

/** Largura máxima do app na web, a de um celular grande. */
const MAX_WIDTH = 480;

/**
 * Na web, com a janela mais larga que um celular, centraliza o app numa coluna.
 * A árvore é a mesma em qualquer largura, para redimensionar a janela não remontar as telas.
 */
export const WebFrame = ({ children }: PropsWithChildren) => {
  const { width } = useWindowDimensions();

  if (Platform.OS !== "web") return <>{children}</>;

  const framed = width > MAX_WIDTH;

  return (
    <View className="flex-1 items-center bg-[#05070a]">
      <View
        className={`w-full flex-1 overflow-hidden bg-prisma-background ${framed ? "border-x border-prisma-field-border" : ""}`}
        style={{
          maxWidth: MAX_WIDTH,
          boxShadow: framed ? "0px 0px 48px rgba(59, 130, 246, 0.10)" : undefined,
        }}
      >
        {children}
      </View>
    </View>
  );
};
