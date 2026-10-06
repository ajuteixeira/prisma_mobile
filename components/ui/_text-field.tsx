import { COLORS } from "@/constants";
import { memo, type ReactNode, type Ref } from "react";
import type { TextInput, TextInputProps } from "react-native";
import { Icon, type IconName } from "./_icon";
import { Input, InputField } from "./input";

type TextFieldProps = TextInputProps & {
  /** Repassado ao `TextInput`, para mover o foco entre campos. */
  ref?: Ref<TextInput>;
  /** Ícone à esquerda do campo. */
  icon?: IconName;
  /** Slot à direita — botão de olho, indicador de validação, etc. */
  trailing?: ReactNode;
};

/**
 * Campo de texto do sistema: 58px de altura, ícone à esquerda e realce no foco,
 * que o `Input` do gluestack aplica via `data-[focus=true]`. As variantes `dark:`
 * sobrepõem as cores neutras do gluestack, já que o app é só escuro.
 */
export const TextField = memo(({ icon, trailing, ref, ...inputProps }: TextFieldProps) => (
  <Input
    className={`h-[58px] gap-3 rounded-2xl border-prisma-field-border bg-prisma-field pl-4 shadow-none dark:bg-prisma-field data-[focus=true]:border-prisma-brand data-[focus=true]:bg-prisma-field-active dark:data-[focus=true]:border-prisma-brand dark:data-[focus=true]:bg-prisma-field-active ${
      trailing ? "pr-2" : "pr-4"
    }`}
  >
    {icon ? <Icon name={icon} size={16} color={COLORS.accent} /> : null}
    <InputField
      // O tipo gerado aponta a ref para as props; em runtime ela chega no `TextInput`.
      ref={ref as unknown as Ref<TextInputProps>}
      // Sem isso o gluestack anuncia todo campo como "Input Field" no leitor de tela.
      aria-label={inputProps.accessibilityLabel ?? inputProps.placeholder}
      className="min-w-0 text-base text-prisma-body"
      placeholderTextColor={COLORS.faint}
      selectionColor={COLORS.accent}
      {...inputProps}
    />
    {trailing}
  </Input>
));

TextField.displayName = "TextField";
