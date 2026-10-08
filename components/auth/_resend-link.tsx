import { formatCountdown } from "@/utils";
import { Pressable, Text } from "react-native";

type ResendLinkProps = {
  /** Rótulo com o reenvio liberado, ex.: "Reenviar código". */
  label: string;
  /** Segundos até liberar o reenvio. */
  remaining: number;
  loading: boolean;
  onPress: () => void;
};

/** Reenvio bloqueado durante a contagem, mostrando quanto falta. */
export const ResendLink = ({ label, remaining, loading, onPress }: ResendLinkProps) => {
  const enabled = remaining <= 0 && !loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !enabled }}
      disabled={!enabled}
      onPress={onPress}
      hitSlop={8}
    >
      <Text
        className={`py-1.5 text-[13.5px] font-semibold ${
          enabled ? "text-prisma-accent" : "text-prisma-faint"
        }`}
      >
        {loading ? "Reenviando…" : remaining > 0 ? `Reenviar em ${formatCountdown(remaining)}` : label}
      </Text>
    </Pressable>
  );
};
