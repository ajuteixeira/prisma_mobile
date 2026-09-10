import { Icon } from "@/components/ui/_icon";
import { IconButton } from "@/components/ui/_icon-button";
import { SegmentedBar } from "@/components/ui/_segmented-bar";
import { TextField } from "@/components/ui/_text-field";
import { COLORS } from "@/constants";
import { memo } from "react";
import { Text, View } from "react-native";

type RegisterPasswordStepProps = {
  password: string;
  onChangePassword: (password: string) => void;
  passwordConfirmation: string;
  onChangePasswordConfirmation: (password: string) => void;
  visible: boolean;
  onToggleVisibility: () => void;
  /** `null` enquanto a confirmação está vazia. */
  passwordsMatch: boolean | null;
  strength: { label: string; color: string; segments: string[] };
  onSubmit: () => void;
};

/** Passo 3 — senha, régua de força e confirmação. */
export const RegisterPasswordStep = memo(
  ({
    password,
    onChangePassword,
    passwordConfirmation,
    onChangePasswordConfirmation,
    visible,
    onToggleVisibility,
    passwordsMatch,
    strength,
    onSubmit,
  }: RegisterPasswordStepProps) => (
    <View className="gap-3">
      <TextField
        icon="lock"
        placeholder="Senha"
        value={password}
        onChangeText={onChangePassword}
        secureTextEntry={!visible}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="next"
        autoFocus
        trailing={
          <IconButton
            icon={visible ? "eyeOff" : "eye"}
            color={COLORS.faint}
            onPress={onToggleVisibility}
            accessibilityLabel={visible ? "Ocultar senha" : "Mostrar senha"}
          />
        }
      />

      <View className="flex-row items-center gap-2.5 px-0.5">
        <View className="flex-1">
          <SegmentedBar colors={strength.segments} gap={5} />
        </View>
        <Text
          className="w-14 text-right text-[11.5px] font-semibold"
          style={{ color: strength.color }}
        >
          {strength.label}
        </Text>
      </View>

      <TextField
        icon="lock"
        placeholder="Confirmar senha"
        value={passwordConfirmation}
        onChangeText={onChangePasswordConfirmation}
        secureTextEntry={!visible}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="done"
        onSubmitEditing={onSubmit}
        trailing={
          <View className="h-10 w-10 items-center justify-center">
            {passwordsMatch === null ? null : (
              <Icon
                name={passwordsMatch ? "checkCircle" : "alert"}
                size={16}
                color={passwordsMatch ? COLORS.success : COLORS.danger}
              />
            )}
          </View>
        }
      />

      <Text className="mx-0.5 text-xs leading-[18px] text-prisma-faint">
        {/* TODO(legal): tornar Termos e Política links reais quando as URLs existirem. */}
        Ao criar a conta você aceita os <Text className="text-prisma-accent">Termos</Text> e a{" "}
        <Text className="text-prisma-accent">Política de Privacidade</Text>.
      </Text>
    </View>
  ),
);

RegisterPasswordStep.displayName = "RegisterPasswordStep";
