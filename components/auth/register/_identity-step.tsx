import { TextField } from "@/components/ui/_text-field";
import { sanitizeUsername } from "@/utils";
import { memo } from "react";
import { Text, View } from "react-native";

type IdentityStepProps = {
  fullName: string;
  onChangeFullName: (fullName: string) => void;
  username: string;
  onChangeUsername: (username: string) => void;
  onSubmit: () => void;
};

/** Nome de exibição e nickname; `onChangeUsername` recebe o nickname já sanitizado. */
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
        onChangeText={(value) => onChangeUsername(sanitizeUsername(value))}
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
