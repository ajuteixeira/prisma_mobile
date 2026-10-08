import { Icon } from "@/components/ui/_icon";
import { IconButton } from "@/components/ui/_icon-button";
import { SegmentedBar } from "@/components/ui/_segmented-bar";
import { TextField } from "@/components/ui/_text-field";
import { COLORS, PASSWORD_STRENGTH_COLORS, PASSWORD_STRENGTH_LABELS } from "@/constants";
import { passwordScore } from "@/utils";
import { memo, useState } from "react";
import { Text, View } from "react-native";

type RegisterPasswordStepProps = {
  password: string;
  onChangePassword: (password: string) => void;
  passwordConfirmation: string;
  onChangePasswordConfirmation: (password: string) => void;
  onSubmit: () => void;
};

/** Passo 3: senha, régua de força e confirmação. */
export const RegisterPasswordStep = memo(
  ({
    password,
    onChangePassword,
    passwordConfirmation,
    onChangePasswordConfirmation,
    onSubmit,
  }: RegisterPasswordStepProps) => {
    const [visible, setVisible] = useState(false);
    const score = passwordScore(password);
    const strengthColor = PASSWORD_STRENGTH_COLORS[score];
    // Os segmentos acesos assumem a cor da pontuação atual.
    const segments = PASSWORD_STRENGTH_COLORS.slice(1).map((_, index) =>
      score > index ? strengthColor : COLORS.track,
    );
    const matches = password === passwordConfirmation;

    return (
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
              onPress={() => setVisible((current) => !current)}
              accessibilityLabel={visible ? "Ocultar senha" : "Mostrar senha"}
            />
          }
        />

        <View className="flex-row items-center gap-2.5 px-0.5">
          <View className="flex-1">
            <SegmentedBar colors={segments} gap={5} />
          </View>
          <Text
            className="w-14 text-right text-[11.5px] font-semibold"
            style={{ color: strengthColor }}
          >
            {password ? PASSWORD_STRENGTH_LABELS[score] : ""}
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
              {passwordConfirmation ? (
                <Icon
                  name={matches ? "checkCircle" : "alert"}
                  size={16}
                  color={matches ? COLORS.success : COLORS.danger}
                />
              ) : null}
            </View>
          }
        />

        <Text className="mx-0.5 text-xs leading-[18px] text-prisma-faint">
          {/* TODO(legal): tornar Termos e Política links reais quando as URLs existirem. */}
          Ao criar a conta você aceita os <Text className="text-prisma-accent">Termos</Text> e a{" "}
          <Text className="text-prisma-accent">Política de Privacidade</Text>.
        </Text>
      </View>
    );
  },
);

RegisterPasswordStep.displayName = "RegisterPasswordStep";
