import { Callout } from "@/components/ui/_callout";
import { TextField } from "@/components/ui/_text-field";
import { memo } from "react";
import { View } from "react-native";

type EmailStepProps = {
  email: string;
  onChangeEmail: (email: string) => void;
  onSubmit: () => void;
};

/** Passo 1 — identificação da conta. */
export const EmailStep = memo(({ email, onChangeEmail, onSubmit }: EmailStepProps) => (
  <View className="gap-3">
    <TextField
      icon="mail"
      placeholder="E-mail da conta"
      value={email}
      onChangeText={onChangeEmail}
      keyboardType="email-address"
      autoCapitalize="none"
      autoCorrect={false}
      autoComplete="email"
      textContentType="emailAddress"
      returnKeyType="send"
      onSubmitEditing={onSubmit}
      autoFocus
    />
    <Callout>O código chega em segundos. Confira também a pasta de spam.</Callout>
  </View>
));

EmailStep.displayName = "EmailStep";
