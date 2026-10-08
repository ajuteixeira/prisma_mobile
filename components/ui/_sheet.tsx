import { memo, useEffect, useState, type PropsWithChildren } from "react";
import {
  Keyboard,
  Platform,
  useWindowDimensions,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Actionsheet, ActionsheetBackdrop, ActionsheetContent } from "./actionsheet";

/**
 * Altura, em pontos, que o teclado cobre na base da tela. No web, o navegador do
 * celular encolhe só a área visível, não a página. No Android a janela já encolhe
 * com o teclado, então devolve 0.
 */
const useKeyboardOverlap = () => {
  const [overlap, setOverlap] = useState(0);

  useEffect(() => {
    if (Platform.OS === "web") {
      const viewport = window.visualViewport;
      if (!viewport) return;

      const update = () =>
        setOverlap(
          Math.max(0, document.documentElement.clientHeight - viewport.height - viewport.offsetTop),
        );
      viewport.addEventListener("resize", update);
      viewport.addEventListener("scroll", update);
      return () => {
        viewport.removeEventListener("resize", update);
        viewport.removeEventListener("scroll", update);
      };
    }
    if (Platform.OS !== "ios") return;

    const show = Keyboard.addListener("keyboardWillShow", (event) =>
      setOverlap(event.endCoordinates.height),
    );
    const hide = Keyboard.addListener("keyboardWillHide", () => setOverlap(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return overlap;
};

type SheetProps = PropsWithChildren<{
  visible: boolean;
  onClose: () => void;
  /** Classes do painel, somadas ao visual padrão (fundo, borda e cantos). */
  className?: string;
  /** Cor do fundo escurecido atrás do painel. */
  backdropColor?: string;
  /** Altura fixa, como fração (0 a 1) da área livre acima do teclado. */
  heightRatio?: number;
  /** Altura máxima, como fração (0 a 1) da área livre acima do teclado. */
  maxHeightRatio?: number;
  style?: StyleProp<ViewStyle>;
}>;

/**
 * Folha que sobe da base da tela e fica acima do teclado. Fecha ao tocar fora e
 * no voltar do Android. A altura vai por `heightRatio`/`maxHeightRatio`, e não por
 * classe: o `ActionsheetContent` sobrescreve `height` no `style` sem `snapPoints`.
 */
export const Sheet = memo(
  ({
    visible,
    onClose,
    className = "",
    backdropColor = "rgba(0, 0, 0, 0.6)",
    heightRatio,
    maxHeightRatio,
    style,
    children,
  }: SheetProps) => {
    const insets = useSafeAreaInsets();
    const keyboard = useKeyboardOverlap();
    const { height: windowHeight } = useWindowDimensions();

    const bottomPadding = keyboard > 0 ? 0 : insets.bottom;
    const available = windowHeight - keyboard;
    const toHeight = (ratio?: number) =>
      ratio === undefined ? undefined : available * ratio - bottomPadding;

    return (
      <Actionsheet isOpen={visible} onClose={onClose}>
        {/* O padrão anima até 50% de opacidade; a transparência fica toda na cor. */}
        <ActionsheetBackdrop animate={{ opacity: 1 }} style={{ backgroundColor: backdropColor }} />
        <View className="flex-1" style={{ paddingBottom: keyboard }} pointerEvents="box-none">
          <ActionsheetContent
            className={`items-stretch rounded-t-[34px] border-0 border-t border-prisma-sheet-border bg-prisma-surface p-0 ${className}`}
            style={[
              {
                paddingBottom: bottomPadding,
                boxShadow: "0px -24px 60px rgba(0, 0, 0, 0.6)",
              },
              style,
            ]}
          >
            <View style={{ height: toHeight(heightRatio), maxHeight: toHeight(maxHeightRatio) }}>
              {children}
            </View>
          </ActionsheetContent>
        </View>
      </Actionsheet>
    );
  },
);

Sheet.displayName = "Sheet";
