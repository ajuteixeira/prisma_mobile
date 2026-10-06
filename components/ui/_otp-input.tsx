import { COLORS } from "@/constants";
import { memo, useCallback, useRef, useState } from "react";
import { TextInput, View, type NativeSyntheticEvent, type TextInputKeyPressEventData } from "react-native";

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  /** Dispara quando o último dígito é preenchido. */
  onComplete?: (value: string) => void;
  /** Código recusado: as caixas ficam vermelhas até a próxima edição. */
  invalid?: boolean;
};

const onlyDigits = (text: string) => text.replace(/\D/g, "");

/**
 * Código de verificação com auto-avanço: digitar preenche e pula para a próxima
 * caixa, apagar volta para a anterior, e colar distribui os dígitos de uma vez.
 */
export const OtpInput = memo(({ value, onChange, length = 6, onComplete, invalid = false }: OtpInputProps) => {
  const inputs = useRef<(TextInput | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const focus = useCallback((index: number) => {
    inputs.current[index]?.focus();
  }, []);

  const commit = useCallback(
    (next: string) => {
      onChange(next);
      if (next.length === length) onComplete?.(next);
    },
    [length, onChange, onComplete],
  );

  const handleChange = useCallback(
    (text: string, index: number) => {
      const digits = onlyDigits(text);

      // Colagem do código inteiro: preenche a partir da caixa atual.
      if (digits.length > 1) {
        const next = (value.slice(0, index) + digits).slice(0, length);
        commit(next);
        focus(Math.min(next.length, length - 1));
        return;
      }

      const chars = value.padEnd(length, " ").split("");
      chars[index] = digits || " ";
      const next = chars.join("").trimEnd();
      commit(next);

      if (digits && index < length - 1) focus(index + 1);
    },
    [commit, focus, length, value],
  );

  const handleKeyPress = useCallback(
    ({ nativeEvent }: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
      if (nativeEvent.key !== "Backspace" || value[index] || index === 0) return;
      // Caixa já vazia: apaga o dígito anterior e recua o foco.
      commit(value.slice(0, index - 1));
      focus(index - 1);
    },
    [commit, focus, value],
  );

  return (
    <View className="flex-row gap-[9px]">
      {Array.from({ length }, (_, index) => {
        const digit = value[index] ?? "";
        const active = focusedIndex === index;

        return (
          <TextInput
            key={index}
            ref={(input) => {
              inputs.current[index] = input;
            }}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(event) => handleKeyPress(event, index)}
            onFocus={() => setFocusedIndex(index)}
            onBlur={() => setFocusedIndex(null)}
            keyboardType="number-pad"
            inputMode="numeric"
            maxLength={length}
            selectTextOnFocus
            textContentType="oneTimeCode"
            autoComplete="sms-otp"
            selectionColor={COLORS.accent}
            accessibilityLabel={`Dígito ${index + 1} de ${length}`}
            // `text-center` num `TextInput` quebra o render no react-native-css 3.0.7
            // (o mapeamento de `textAlign` chama `split` em `true`); vai por `style`.
            style={{ textAlign: "center" }}
            className={`h-16 min-w-0 flex-1 rounded-2xl border text-[26px] font-bold text-prisma-ink ${
              active ? "bg-prisma-field-active" : "bg-prisma-field"
            } ${
              invalid
                ? "border-prisma-danger-border"
                : active
                  ? "border-prisma-brand"
                  : "border-prisma-field-border-strong"
            }`}
          />
        );
      })}
    </View>
  );
});

OtpInput.displayName = "OtpInput";
