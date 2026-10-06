import { Sheet } from "@/components/ui/_sheet";
import { memo, type PropsWithChildren } from "react";
import { View } from "react-native";

type SettingsSheetProps = PropsWithChildren<{
  visible: boolean;
  onClose: () => void;
}>;

/** Bottom sheet das confirmações de Configurações, no padrão do sheet de login. */
export const SettingsSheet = memo(({ visible, onClose, children }: SettingsSheetProps) => (
  <Sheet visible={visible} onClose={onClose} className="px-6 pt-[30px]">
    <View className="pb-[46px]">{children}</View>
  </Sheet>
));

SettingsSheet.displayName = "SettingsSheet";
