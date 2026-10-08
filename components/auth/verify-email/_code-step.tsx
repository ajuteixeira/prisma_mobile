import { Icon } from "@/components/ui/_icon";
import { OtpInput } from "@/components/ui/_otp-input";
import { memo } from "react";
import { Text, View } from "react-native";
import { ResendLink } from "../_resend-link";

type CodeStepProps = {
  email: string;
  code: string;
  onChangeCode: (code: string) => void;
  codeLength: number;
  /** Código recusado pela API: as caixas ficam vermelhas. */
  invalid: boolean;
  /** Segundos até liberar o reenvio. */
  resendIn: number;
  resending: boolean;
  onResend: () => void;
};

/** Caixas do código enviado para `email`, com o reenvio liberado ao fim da contagem. */
export const CodeStep = memo(
  ({
    email,
    code,
    onChangeCode,
    codeLength,
    invalid,
    resendIn,
    resending,
    onResend,
  }: CodeStepProps) => (
    <View>
      <View className="flex-row items-center gap-3.5 rounded-[18px] border border-prisma-info-border bg-prisma-info-bg px-4 py-3.5">
        <View className="h-11 w-11 items-center justify-center rounded-[14px] bg-prisma-field-active">
          <Icon name="mailOpen" size={19} />
        </View>
        <View className="min-w-0 flex-1">
          <Text className="text-[12.5px] text-prisma-muted">
            Enviamos um código de {codeLength} dígitos para
          </Text>
          <Text className="mt-[3px] text-[15px] font-bold text-prisma-ink" numberOfLines={1}>
            {email}
          </Text>
        </View>
      </View>

      <Text
        className="mx-0.5 mb-2.5 mt-6 text-xs font-semibold text-prisma-faint"
        style={{ letterSpacing: 0.8 }}
      >
        CÓDIGO DE VERIFICAÇÃO
      </Text>
      <OtpInput value={code} onChange={onChangeCode} length={codeLength} invalid={invalid} />

      <View className="mt-4 flex-row items-center justify-between">
        <Text className="text-[13px] text-prisma-faint">Não recebeu? Veja o spam.</Text>
        <ResendLink
          label="Reenviar código"
          remaining={resendIn}
          loading={resending}
          onPress={onResend}
        />
      </View>
    </View>
  ),
);

CodeStep.displayName = "CodeStep";
