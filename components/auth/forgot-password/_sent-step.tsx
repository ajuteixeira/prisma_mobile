import { Callout } from "@/components/ui/_callout";
import { Icon } from "@/components/ui/_icon";
import { COLORS } from "@/constants";
import { MotiView } from "moti";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";

type SentStepProps = {
  email: string;
  resendLabel: string;
  canResend: boolean;
  onResend: () => void;
};

/** Passo 2 — link enviado; a nova senha é definida na versão web. */
export const SentStep = memo(({ email, resendLabel, canResend, onResend }: SentStepProps) => (
  <View>
    <View className="items-center px-2 pt-1.5">
      <MotiView
        from={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "timing", duration: 320 }}
        className="mb-[18px] h-[76px] w-[76px] items-center justify-center rounded-full border-[1.5px] border-prisma-success-border bg-prisma-success-bg"
      >
        <Icon name="mail" size={30} color={COLORS.success} />
      </MotiView>

      <Text className="text-xl font-bold text-prisma-ink">Link enviado</Text>
      <Text className="mt-2 text-center text-[13.5px] leading-5 text-prisma-muted">
        Abra o e-mail enviado para{" "}
        <Text className="font-semibold text-prisma-ink">{email.trim()}</Text> e toque no link para
        criar uma nova senha.
      </Text>
    </View>

    <View className="mt-6">
      <Callout>O link expira em breve. Confira também a pasta de spam.</Callout>
    </View>

    <View className="mt-4 flex-row items-center justify-between">
      <Text className="text-[13px] text-prisma-faint">Não recebeu?</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !canResend }}
        disabled={!canResend}
        onPress={onResend}
        hitSlop={8}
      >
        <Text
          className={`py-1.5 text-[13.5px] font-semibold ${
            canResend ? "text-prisma-accent" : "text-prisma-faint"
          }`}
        >
          {resendLabel}
        </Text>
      </Pressable>
    </View>
  </View>
));

SentStep.displayName = "SentStep";
