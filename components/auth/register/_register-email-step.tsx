import { Callout } from "@/components/ui/_callout";
import { TextField } from "@/components/ui/_text-field";
import { memo } from "react";
import { View } from "react-native";

type RegisterEmailStepProps = {
  email: string;
  onChangeEmail: (email: string) => void;
  onSubmit: () => void;
};

/** Passo 2 — e-mail da conta, com o aviso de privacidade do protótipo. */
export const RegisterEmailStep = memo(
  ({ email, onChangeEmail, onSubmit }: RegisterEmailStepProps) => (
    <View className="gap-3">
      <TextField
        icon="mail"
        placeholder="seu@email.com"
        value={email}
        onChangeText={onChangeEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
        onSubmitEditing={onSubmit}
        autoFocus
      />

      <Callout icon="shield">
        Enviaremos um código de confirmação. Seu e-mail nunca aparece no perfil público.
      </Callout>
    </View>
  ),
);

RegisterEmailStep.displayName = "RegisterEmailStep";
