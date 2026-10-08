import { Text } from "react-native";

type AuthPromptProps = { question: string; action: string; onPress: () => void };

/** Convite no rodapé do sheet, ex.: "Já tem uma conta? Entrar". */
export const AuthPrompt = ({ question, action, onPress }: AuthPromptProps) => (
  <Text className="mt-[18px] text-center text-sm text-prisma-muted">
    {question}{" "}
    <Text className="font-semibold text-prisma-accent" accessibilityRole="link" onPress={onPress}>
      {action}
    </Text>
  </Text>
);
