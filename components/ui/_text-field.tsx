import { COLORS } from "@/constants";
import { memo, useState, type ReactNode, type Ref } from "react";
import { TextInput, View, type TextInputProps } from "react-native";
import { Icon, type IconName } from "./_icon";

type TextFieldProps = TextInputProps & {
  /** Repassado ao `TextInput`, para mover o foco entre campos. */
  ref?: Ref<TextInput>;
  /** Ícone à esquerda do campo. */
  icon?: IconName;
  /** Slot à direita — botão de olho, indicador de validação, etc. */
  trailing?: ReactNode;
};

/** Campo de texto do sistema: 58px de altura, ícone à esquerda e realce no foco. */
export const TextField = memo(({ icon, trailing, onFocus, onBlur, ...inputProps }: TextFieldProps) => {
  const [focused, setFocused] = useState(false);

  return (
    <View
      className={`h-[58px] flex-row items-center gap-3 rounded-2xl border pl-4 ${
        trailing ? "pr-2" : "pr-4"
      } ${focused ? "border-prisma-brand bg-prisma-field-active" : "border-prisma-field-border bg-prisma-field"}`}
    >
      {icon ? <Icon name={icon} size={16} color={COLORS.accent} /> : null}
      <TextInput
        className="min-w-0 flex-1 text-base text-prisma-body"
        placeholderTextColor={COLORS.faint}
        selectionColor={COLORS.accent}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        {...inputProps}
      />
      {trailing}
    </View>
  );
});

TextField.displayName = "TextField";
