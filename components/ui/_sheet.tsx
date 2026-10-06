import { memo, type PropsWithChildren } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Actionsheet, ActionsheetBackdrop, ActionsheetContent } from "./actionsheet";

type SheetProps = PropsWithChildren<{
  visible: boolean;
  onClose: () => void;
  /** Classes do painel, somadas ao visual padrão (fundo, borda e cantos). */
  className?: string;
  /** Cor do fundo escurecido atrás do painel. */
  backdropColor?: string;
  style?: StyleProp<ViewStyle>;
}>;

export const Sheet = memo(
  ({
    visible,
    onClose,
    className = "",
    backdropColor = "rgba(0, 0, 0, 0.6)",
    style,
    children,
  }: SheetProps) => (
    <Actionsheet isOpen={visible} onClose={onClose}>
      {/* O backdrop é um componente do `@legendapp/motion` e não recebe `className`
          no nativo: posição e cor vão por `style`. */}
      <ActionsheetBackdrop style={[StyleSheet.absoluteFill, { backgroundColor: backdropColor }]} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        pointerEvents="box-none"
      >
        <ActionsheetContent
          className={`items-stretch rounded-t-[34px] border-t border-prisma-sheet-border bg-prisma-surface p-0 pb-safe dark:border-prisma-sheet-border ${className}`}
          style={[{ boxShadow: "0px -24px 60px rgba(0, 0, 0, 0.6)" }, style]}
        >
          {children}
        </ActionsheetContent>
      </KeyboardAvoidingView>
    </Actionsheet>
  ),
);

Sheet.displayName = "Sheet";
