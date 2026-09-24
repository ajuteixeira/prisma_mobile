import { IconButton } from "@/components/ui/_icon-button";
import { TextField } from "@/components/ui/_text-field";
import { COLORS } from "@/constants";
import { memo, useRef } from "react";
import { Text, TextInput, View } from "react-native";

type LoginFormProps = {
  email: string;
  onChangeEmail: (email: string) => void;
  password: string;
  onChangePassword: (password: string) => void;
  passwordVisible: boolean;
  onTogglePasswordVisibility: () => void;
  onForgotPassword: () => void;
  onSubmit: () => void;
};

/** Campos de e-mail e senha do login, com o atalho para recuperar a senha. */
export const LoginForm = memo(
  ({
    email,
    onChangeEmail,
    password,
    onChangePassword,
    passwordVisible,
    onTogglePasswordVisibility,
    onForgotPassword,
    onSubmit,
  }: LoginFormProps) => {
    const passwordRef = useRef<TextInput>(null);

    return (
      <View>
        <Text
          accessibilityRole="header"
          className="mb-5 text-[21px] font-bold text-white"
          style={{ letterSpacing: -0.3 }}
        >
          Entrar
        </Text>

        <View className="gap-3">
          <TextField
            icon="mail"
            placeholder="E-mail"
            value={email}
            onChangeText={onChangeEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
          <TextField
            ref={passwordRef}
            icon="lock"
            placeholder="Senha"
            value={password}
            onChangeText={onChangePassword}
            secureTextEntry={!passwordVisible}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="current-password"
            textContentType="password"
            returnKeyType="go"
            onSubmitEditing={onSubmit}
            trailing={
              <IconButton
                icon={passwordVisible ? "eyeOff" : "eye"}
                color={COLORS.faint}
                onPress={onTogglePasswordVisibility}
                accessibilityLabel={passwordVisible ? "Ocultar senha" : "Mostrar senha"}
              />
            }
          />
        </View>

        <View className="mb-[22px] mt-4 flex-row justify-end">
          <Text
            className="text-[13.5px] font-medium text-prisma-accent"
            accessibilityRole="link"
            onPress={onForgotPassword}
            suppressHighlighting
          >
            Esqueci a senha
          </Text>
        </View>
      </View>
    );
  },
);

LoginForm.displayName = "LoginForm";
