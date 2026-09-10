import { COLORS } from "@/constants";
import { usePressed } from "@/hooks/_use-pressed";
import { memo } from "react";
import { Pressable, type PressableProps } from "react-native";
import { Icon, type IconName } from "./_icon";

type IconButtonProps = Omit<PressableProps, "children" | "style"> & {
  icon: IconName;
  size?: number;
  color?: string;
  /** `ghost` desenha a moldura translúcida usada no botão de voltar. */
  variant?: "ghost" | "bare";
  className?: string;
};

export const IconButton = memo(
  ({
    icon,
    size = 15,
    color = COLORS.body,
    variant = "bare",
    className = "",
    ...pressableProps
  }: IconButtonProps) => {
    const { pressed, handlers } = usePressed();

    return (
      <Pressable
        accessibilityRole="button"
        hitSlop={8}
        className={`h-10 w-10 items-center justify-center ${
          variant === "ghost" ? "rounded-xl border border-prisma-ghost-border bg-prisma-ghost-bg" : ""
        } ${className}`}
        {...pressableProps}
        {...handlers}
        style={{ opacity: pressed ? 0.6 : 1 }}
      >
        <Icon name={icon} size={size} color={color} />
      </Pressable>
    );
  },
);

IconButton.displayName = "IconButton";
