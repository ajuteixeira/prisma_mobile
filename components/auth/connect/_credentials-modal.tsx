import { Callout } from "@/components/ui/_callout";
import { GradientButton } from "@/components/ui/_gradient-button";
import { Icon } from "@/components/ui/_icon";
import { IconButton } from "@/components/ui/_icon-button";
import { Sheet } from "@/components/ui/_sheet";
import { Input, InputField } from "@/components/ui/input";
import { COLORS, type Platform, type PlatformInstruction } from "@/constants";
import { usePressed } from "@/hooks/_use-pressed";
import { memo, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Platform as RNPlatform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

const MONOSPACE = RNPlatform.select({ ios: "Menlo", default: "monospace" });

/** Passo numerado, com o link oficial quando o protótipo indica um. */
const Instruction = memo(({ title, body, link }: PlatformInstruction) => (
  <View className="rounded-r-[14px] border-l-[3px] border-prisma-brand bg-prisma-hint-bg px-[15px] py-[13px]">
    <Text className="text-[13px] font-bold text-prisma-hint-title">{title}</Text>
    <Text className="mt-1.5 text-[12.5px] leading-[19px] text-prisma-muted">{body}</Text>

    {link ? (
      <Text
        accessibilityRole="link"
        className="mt-2 text-[12.5px] font-semibold text-prisma-accent"
        onPress={() => Linking.openURL(link.url)}
      >
        {link.label}
      </Text>
    ) : null}
  </View>
));

Instruction.displayName = "Instruction";

type FieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
};

/**
 * Campo do modal: rótulo acima e caixa mais baixa que a do formulário padrão. O
 * realce de foco vem do `Input` (`data-[focus=true]`).
 */
const Field = memo(({ label, placeholder, value, onChangeText }: FieldProps) => (
  <View>
    <Text className="mb-2 ml-0.5 text-[12.5px] font-semibold text-prisma-body">{label}</Text>
    <Input className="h-[54px] rounded-[15px] border-prisma-ghost-border bg-prisma-sunken px-4 data-[hover=true]:border-prisma-ghost-border data-[focus=true]:border-prisma-brand data-[focus=true]:bg-prisma-field-active data-[focus=true]:hover:border-prisma-brand data-[focus=true]:web:ring-0">
      <InputField
        aria-label={label}
        className="px-0 text-[15px] text-prisma-body placeholder:text-prisma-faint"
        placeholder={placeholder}
        placeholderTextColor={COLORS.faint}
        selectionColor={COLORS.accent}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="off"
      />
    </Input>
  </View>
));

Field.displayName = "Field";

type CredentialsModalProps = {
  /** `null` mantém o modal fechado. */
  platform: Platform | null;
  loading: boolean;
  /** Falha da última tentativa, exibida acima dos botões. */
  error: string | null;
  /** Código `PRISMA-XXXX` emitido pelo backend (só PSN e RetroAchievements). */
  verificationCode: string | null;
  codeLoading: boolean;
  onRegenerateCode: () => void;
  /** Recebe os campos já sem espaços nas pontas, na ordem do catálogo. */
  onSubmit: (values: string[]) => void;
  onClose: () => void;
};

/**
 * Sheet de credenciais das plataformas que não usam OAuth: instruções numeradas,
 * o código que prova a posse da conta e os campos de chave/token.
 */
export const CredentialsModal = memo(
  ({
    platform,
    loading,
    error,
    verificationCode,
    codeLoading,
    onRegenerateCode,
    onSubmit,
    onClose,
  }: CredentialsModalProps) => {
    const { pressed, handlers } = usePressed();
    const [values, setValues] = useState<string[]>([]);

    if (!platform) return null;

    const [firstStep, ...remainingSteps] = platform.instructions ?? [];
    const fields = platform.fields ?? [];
    const trimmed = fields.map((_, index) => (values[index] ?? "").trim());
    const ready =
      fields.length > 0 &&
      trimmed.every(Boolean) &&
      (!platform.ownershipCode || verificationCode !== null);

    return (
      <Sheet
        visible
        onClose={onClose}
        backdropColor="rgba(4, 7, 11, 0.72)"
        maxHeightRatio={0.88}
        className="rounded-t-[28px] border border-b-0 bg-prisma-elevated"
        style={{ boxShadow: "0px -20px 60px rgba(0, 0, 0, 0.7)" }}
      >
        <View className="flex-row items-center gap-[13px] border-b border-prisma-field-border px-[22px] pb-4 pt-5">
          <View
            className="h-[46px] w-[46px] items-center justify-center rounded-[13px]"
            style={{ backgroundColor: platform.tint }}
          >
            <Icon name={platform.icon} size={21} color={platform.color} />
          </View>

          <View className="flex-1">
            <Text className="text-[17px] font-bold text-prisma-ink">{platform.name}</Text>
            <Text className="text-[13px] text-prisma-muted">Configuração de API</Text>
          </View>

          <IconButton
            icon="close"
            size={14}
            color={COLORS.muted}
            variant="ghost"
            onPress={onClose}
            accessibilityLabel="Fechar"
          />
        </View>

        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 22,
            paddingTop: 18,
            paddingBottom: 8,
            gap: 12,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {firstStep ? <Instruction {...firstStep} /> : null}

          {platform.ownershipCode ? (
            <View className="rounded-2xl border border-prisma-ghost-border bg-prisma-sunken px-4 py-3.5">
              <Text className="text-[11.5px] text-prisma-faint">Código de verificação</Text>
              {/* TODO(deps): com `expo-clipboard` instalado, trocar por um botão
                  de copiar; hoje o código é selecionável no toque longo. */}
              {verificationCode ? (
                <Text
                  selectable
                  className="mt-1.5 text-[21px] font-bold text-prisma-ink"
                  style={{ letterSpacing: 2, fontFamily: MONOSPACE }}
                >
                  {verificationCode}
                </Text>
              ) : codeLoading ? (
                <ActivityIndicator
                  className="mt-2 self-start"
                  size="small"
                  color={COLORS.accentSoft}
                />
              ) : (
                <Text
                  accessibilityRole="button"
                  className="mt-2 text-[13px] font-semibold text-prisma-accent"
                  onPress={onRegenerateCode}
                >
                  Gerar código
                </Text>
              )}
            </View>
          ) : null}

          {remainingSteps.map((step) => (
            <Instruction key={step.title} {...step} />
          ))}

          {fields.map((field, index) => (
            <Field
              key={field.label}
              label={field.label}
              placeholder={field.placeholder}
              value={values[index] ?? ""}
              onChangeText={(value) =>
                setValues((current) => Object.assign([...current], { [index]: value }))
              }
            />
          ))}

          {error ? <Callout tone="danger">{error}</Callout> : null}
        </ScrollView>

        <View className="flex-row gap-3 border-t border-prisma-field-border px-[22px] pb-4 pt-4">
          <Pressable
            accessibilityRole="button"
            onPress={onClose}
            disabled={loading}
            className="h-[54px] w-[104px] items-center justify-center rounded-2xl border border-prisma-field-border-strong bg-prisma-ghost-bg"
            {...handlers}
            style={{ opacity: pressed || loading ? 0.6 : 1 }}
          >
            <Text className="text-[15.5px] font-bold text-prisma-body">Sair</Text>
          </Pressable>

          <GradientButton
            className="flex-1"
            label={loading ? "Vinculando…" : "Vincular Conta"}
            loading={loading}
            dimmed={!ready}
            height={54}
            radius={16}
            onPress={() => {
              if (ready && !loading) onSubmit(trimmed);
            }}
          />
        </View>
      </Sheet>
    );
  },
);

CredentialsModal.displayName = "CredentialsModal";
