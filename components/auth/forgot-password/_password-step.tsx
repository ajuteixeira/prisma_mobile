import { Icon } from "@/components/ui/_icon";
import { IconButton } from "@/components/ui/_icon-button";
import { TextField } from "@/components/ui/_text-field";
import { COLORS } from "@/constants";
import { memo } from "react";
import { View } from "react-native";

type PasswordStepProps = {
  password: string;
  onChangePassword: (password: string) => void;
  passwordConfirmation: string;
  onChangePasswordConfirmation: (password: string) => void;
  visible: boolean;
  onToggleVisibility: () => void;
  /** `null` enquanto a confirmação está vazia. */
  passwordsMatch: boolean | null;
  onSubmit: () => void;
};

/** Passo 3 — nova senha e confirmação, com visibilidade compartilhada. */
export const PasswordStep = memo(
  ({
    password,
    onChangePassword,
    passwordConfirmation,
    onChangePasswordConfirmation,
    visible,
    onToggleVisibility,
    passwordsMatch,
    onSubmit,
  }: PasswordStepProps) => (
    <View className="gap-3">
      <TextField
        icon="lock"
        placeholder="Nova senha"
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

      <TextField
        icon="lock"
        placeholder="Confirmar nova senha"
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
    </View>
  ),
);

PasswordStep.displayName = "PasswordStep";
