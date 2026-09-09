import { Icon } from "@/components/ui/_icon";
import { COLORS } from "@/constants";
import { MotiView } from "moti";
import { memo } from "react";
import { Text, View } from "react-native";

/** Passo 4 — confirmação da redefinição. */
export const SuccessStep = memo(() => (
  <View className="items-center px-2 pt-1.5">
    <MotiView
      from={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "timing", duration: 320 }}
      className="mb-[18px] h-[76px] w-[76px] items-center justify-center rounded-full border-[1.5px] border-prisma-success-border bg-prisma-success-bg"
    >
      <Icon name="check" size={30} color={COLORS.success} />
    </MotiView>

    <Text className="text-xl font-bold text-prisma-ink">Senha redefinida</Text>
    <Text className="mt-2 text-center text-[13.5px] leading-5 text-prisma-muted">
      Sua nova senha já está ativa. Entre novamente para continuar.
    </Text>
  </View>
));

SuccessStep.displayName = "SuccessStep";
