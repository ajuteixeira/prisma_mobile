import { memo, type PropsWithChildren } from "react";
import { Modal, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MotiView } from "moti";

type SettingsSheetProps = PropsWithChildren<{
  visible: boolean;
  onClose: () => void;
}>;

/**
 * Bottom sheet de Configurações: overlay escuro + painel arredondado no mesmo
 * padrão do sheet de login (`rounded-t-[34px]`, borda azul translúcida).
 */
export const SettingsSheet = memo(({ visible, onClose, children }: SettingsSheetProps) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1 justify-end bg-black/60">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fechar"
          className="absolute inset-0"
          onPress={onClose}
        />
        <MotiView
          from={{ translateY: 48, opacity: 0 }}
          animate={{ translateY: 0, opacity: 1 }}
          transition={{ type: "timing", duration: 280 }}
          className="rounded-t-[34px] border-t border-prisma-sheet-border bg-prisma-surface px-6 pt-[30px]"
          style={{
            paddingBottom: Math.max(insets.bottom, 0) + 46,
            boxShadow: "0px -24px 60px rgba(0, 0, 0, 0.6)",
          }}
        >
          {children}
        </MotiView>
      </View>
    </Modal>
  );
});

SettingsSheet.displayName = "SettingsSheet";
