import { BRAND_GRADIENT } from "@/constants";
import { LinearGradient } from "expo-linear-gradient";
import { memo } from "react";
import { ActivityIndicator, Pressable, Text, type PressableProps } from "react-native";

type GradientButtonProps = Omit<PressableProps, "children" | "style"> & {
  label: string;
  loading?: boolean;
};

/** Botão primário do sistema: gradiente 135deg com brilho projetado. */
export const GradientButton = memo(
  ({ label, loading = false, disabled, ...pressableProps }: GradientButtonProps) => {
    const isBlocked = disabled || loading;

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !!isBlocked, busy: loading }}
        disabled={isBlocked}
        style={({ pressed }) => ({
          opacity: isBlocked ? 0.55 : pressed ? 0.85 : 1,
          transform: [{ scale: pressed && !isBlocked ? 0.99 : 1 }],
        })}
        {...pressableProps}
      >
        <LinearGradient
          colors={BRAND_GRADIENT}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            height: 58,
            borderRadius: 18,
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
