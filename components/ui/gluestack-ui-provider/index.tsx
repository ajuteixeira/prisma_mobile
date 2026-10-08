import { OverlayProvider } from "@gluestack-ui/core/overlay/creator";
import type { PropsWithChildren } from "react";
import { View } from "react-native";

/** Camada onde o gluestack desenha folhas, diálogos e modais, por cima das telas. Fica na raiz do app. */
export const GluestackUIProvider = ({ children }: PropsWithChildren) => (
  <View style={{ flex: 1 }}>
    <OverlayProvider>{children}</OverlayProvider>
  </View>
);
