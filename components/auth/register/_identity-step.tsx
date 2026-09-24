import { TextField } from "@/components/ui/_text-field";
import { memo } from "react";
import { Text, View } from "react-native";

type IdentityStepProps = {
  fullName: string;
  onChangeFullName: (fullName: string) => void;
  username: string;
  onChangeUsername: (username: string) => void;
  onSubmit: () => void;
};

/** Passo 1 — nome de exibição e o @ público, já sanitizado enquanto digita. */
export const IdentityStep = memo(
  ({
    fullName,
    onChangeFullName,
    username,
    onChangeUsername,
    onSubmit,
  }: IdentityStepProps) => (
    <View className="gap-3">
      <TextField
        icon="user"
        placeholder="Nome completo"
        value={fullName}
        onChangeText={onChangeFullName}
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
        returnKeyType="next"
        autoFocus
      />

      <TextField
        icon="at"
        placeholder="nickname"
        value={username}
        onChangeText={onChangeUsername}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="username-new"
        textContentType="username"
        returnKeyType="next"
        onSubmitEditing={onSubmit}
      />

      <Text className="mx-0.5 mt-0.5 text-xs leading-[18px] text-prisma-faint">
        Apenas letras minúsculas, números e underscore. Este será seu @ público no Prisma.
      </Text>
    </View>
  ),
);

IdentityStep.displayName = "IdentityStep";
