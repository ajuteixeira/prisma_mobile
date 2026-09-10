import { BRAND_GRADIENT } from "@/constants";
import { usePressed } from "@/hooks/_use-pressed";
import { LinearGradient } from "expo-linear-gradient";
import { memo } from "react";
import { ActivityIndicator, Pressable, Text, type PressableProps } from "react-native";

type GradientButtonProps = Omit<PressableProps, "children" | "style"> & {
  label: string;
  loading?: boolean;
  /** Esmaece o botão sem bloquear o toque: o passo ainda não está válido. */
  dimmed?: boolean;
  /** O modal de credenciais usa uma versão levemente menor. */
  height?: number;
  radius?: number;
};

/** Botão primário do sistema: gradiente 135deg com brilho projetado. */
export const GradientButton = memo(
  ({
    label,
    loading = false,
    dimmed = false,
    height = 58,
    radius = 18,
    disabled,
    ...pressableProps
  }: GradientButtonProps) => {
    const isBlocked = disabled || loading;
    const { pressed, handlers } = usePressed();

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !!isBlocked, busy: loading }}
        disabled={isBlocked}
        {...pressableProps}
        {...handlers}
        style={{
          opacity: isBlocked ? 0.55 : (dimmed ? 0.5 : 1) * (pressed ? 0.85 : 1),
          transform: [{ scale: pressed && !isBlocked ? 0.99 : 1 }],
        }}
      >
        <LinearGradient
          colors={BRAND_GRADIENT}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            height,
            borderRadius: radius,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            boxShadow: "0px 12px 30px rgba(59, 130, 246, 0.32)",
          }}
        >
          {loading ? <ActivityIndicator size="small" color="#ffffff" /> : null}
          <Text className="text-[16.5px] font-bold text-white">{label}</Text>
        </LinearGradient>
      </Pressable>
    );
  },
);

GradientButton.displayName = "GradientButton";
