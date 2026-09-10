import { OtpInput } from "@/components/ui/_otp-input";
import { CODE_LENGTH } from "@/hooks/_use-forgot-password";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";

type CodeStepProps = {
  code: string;
  onChangeCode: (code: string) => void;
  onComplete: () => void;
  resendLabel: string;
  canResend: boolean;
  onResend: () => void;
};

/** Passo 2 — código de verificação com auto-avanço e reenvio em contagem. */
export const CodeStep = memo(
  ({ code, onChangeCode, onComplete, resendLabel, canResend, onResend }: CodeStepProps) => (
    <View>
      <OtpInput value={code} onChange={onChangeCode} length={CODE_LENGTH} onComplete={onComplete} />

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
  ),
);

CodeStep.displayName = "CodeStep";
