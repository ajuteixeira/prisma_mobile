import { Callout } from "@/components/ui/_callout";
import { GradientButton } from "@/components/ui/_gradient-button";
import { Icon } from "@/components/ui/_icon";
import { IconButton } from "@/components/ui/_icon-button";
import { COLORS, type Platform, type PlatformInstruction, type PlatformSlug } from "@/constants";
import { usePressed } from "@/hooks/_use-pressed";
import { MotiView } from "moti";
import { memo, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Modal,
  Platform as RNPlatform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

/** Campo do modal: rótulo acima e caixa mais baixa que a do formulário padrão. */
const Field = memo(({ label, placeholder, value, onChangeText }: FieldProps) => {
  const [focused, setFocused] = useState(false);

  return (
    <View>
      <Text className="mb-2 ml-0.5 text-[12.5px] font-semibold text-prisma-body">{label}</Text>
      <TextInput
        className={`h-[54px] rounded-[15px] border px-4 text-[15px] text-prisma-body ${
          focused
            ? "border-prisma-brand bg-prisma-field-active"
            : "border-prisma-ghost-border bg-prisma-sunken"
        }`}
        placeholder={placeholder}
        placeholderTextColor={COLORS.faint}
        selectionColor={COLORS.accent}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="off"
      />
    </View>
  );
});

Field.displayName = "Field";

type CredentialsModalProps = {
  /** `null` mantém o modal fechado. */
  platform: Platform | null;
  values: string[];
  onChangeField: (slug: PlatformSlug, index: number, value: string) => void;
  /** Todos os campos preenchidos. */
  ready: boolean;
  loading: boolean;
  /** Falha da última tentativa, exibida acima dos botões. */
  error: string | null;
  /** Código `PRISMA-XXXX` emitido pelo backend (só PSN e RetroAchievements). */
  verificationCode: string | null;
  codeLoading: boolean;
  onRegenerateCode: () => void;
  onSubmit: () => void;
  onClose: () => void;
};

/**
 * Sheet de credenciais das plataformas que não usam OAuth: instruções numeradas,
 * o código que prova a posse da conta e os campos de chave/token.
 */
export const CredentialsModal = memo(
  ({
    platform,
    values,
    onChangeField,
    ready,
    loading,
    error,
    verificationCode,
    codeLoading,
    onRegenerateCode,
    onSubmit,
    onClose,
  }: CredentialsModalProps) => {
    const insets = useSafeAreaInsets();

    const { pressed, handlers } = usePressed();

    if (!platform) return null;

    const [firstStep, ...remainingSteps] = platform.instructions ?? [];

    return (
      <Modal visible transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
        <View className="flex-1 justify-end bg-prisma-overlay">
          {/* Tocar fora fecha, como no protótipo. */}
          <Pressable
            className="min-h-[54px] flex-1"
            accessibilityLabel="Fechar"
            onPress={onClose}
          />

          <MotiView
            from={{ translateY: 40, opacity: 0 }}
            animate={{ translateY: 0, opacity: 1 }}
            transition={{ type: "timing", duration: 240 }}
            className="rounded-t-[28px] border border-b-0 border-prisma-sheet-border bg-prisma-elevated"
            style={{ maxHeight: "88%", boxShadow: "0px -20px 60px rgba(0, 0, 0, 0.7)" }}
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

              {(platform.fields ?? []).map((field, index) => (
                <Field
                  key={field.label}
                  label={field.label}
                  placeholder={field.placeholder}
                  value={values[index] ?? ""}
                  onChangeText={(value) => onChangeField(platform.slug, index, value)}
                />
              ))}

              {error ? <Callout tone="danger">{error}</Callout> : null}
            </ScrollView>

            <View
              className="flex-row gap-3 border-t border-prisma-field-border px-[22px] pt-4"
              style={{ paddingBottom: Math.max(insets.bottom, 16) + 16 }}
            >
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
                onPress={onSubmit}
              />
            </View>
          </MotiView>
        </View>
      </Modal>
    );
  },
);

CredentialsModal.displayName = "CredentialsModal";
