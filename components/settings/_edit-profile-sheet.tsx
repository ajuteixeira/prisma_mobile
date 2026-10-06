import {
  Callout,
  GradientButton,
  Icon,
  IconButton,
  Sheet,
  SpectrumAvatar,
  TextField,
} from "@/components/ui";
import { BRAND_GRADIENT, COLORS } from "@/constants";
import { BIO_MAX, type NickStatus, type useEditProfile } from "@/hooks/_use-edit-profile";
import { LinearGradient } from "expo-linear-gradient";
import { memo, type ReactNode } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";

type EditProfileFlow = ReturnType<typeof useEditProfile>;

const NICK_STATUS: Record<NickStatus, { label: string; color: string } | null> = {
  idle: null,
  checking: null,
  available: { label: "disponível", color: COLORS.success },
  taken: { label: "em uso", color: COLORS.danger },
  invalid: { label: "inválido", color: COLORS.danger },
};

const Field = ({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
}) => (
  <View>
    <Text className="mb-2 text-[12.5px] font-semibold text-slate-300">{label}</Text>
    {children}
    {error ? (
      <Text className="mx-0.5 mt-2 text-[12px] leading-[18px] text-prisma-danger">{error}</Text>
    ) : hint ? (
      <Text className="mx-0.5 mt-2 text-[12px] leading-[18px] text-prisma-faint">{hint}</Text>
    ) : null}
  </View>
);

const CameraBadge = (
  <View
    className="absolute bottom-0.5 right-0 h-[34px] w-[34px] overflow-hidden rounded-full border-[3px]"
    style={{ borderColor: COLORS.surface }}
  >
    <LinearGradient
      colors={[...BRAND_GRADIENT]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
    >
      <Icon name="camera" size={13} color="#ffffff" />
    </LinearGradient>
  </View>
);

/**
 * Sheet alta "Editar perfil" (artboard 6d): foto com o anel do espectro, nome,
 * nickname com checagem de disponibilidade e bio com contador.
 */
export const EditProfileSheet = memo(({ flow }: { flow: EditProfileFlow }) => {
  const nick = NICK_STATUS[flow.nickStatus];

  return (
    // Sheet alta: ocupa quase a tela e encolhe junto com o teclado.
    <Sheet
      visible={flow.visible}
      onClose={flow.close}
      className="h-[92%] max-h-[92%] overflow-hidden"
    >
      <View className="flex-row items-center justify-between pb-2 pl-6 pr-5 pt-[22px]">
        <Text className="text-[21px] font-bold text-white" style={{ letterSpacing: -0.3 }}>
          Editar perfil
        </Text>
        <IconButton
          icon="close"
          variant="ghost"
          color={COLORS.muted}
          accessibilityLabel="Fechar edição"
          onPress={flow.close}
          className="h-[38px] w-[38px]"
        />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-5 pt-2.5"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Escolher foto"
            onPress={flow.pickPhoto}
          >
            <SpectrumAvatar
              username={flow.avatarSeed}
              uri={flow.draft.avatarUri}
              size={104}
              badge={CameraBadge}
            />
          </Pressable>
          <Pressable accessibilityRole="button" onPress={flow.pickPhoto} className="mt-3.5 px-2.5 py-1.5">
            <Text className="text-[14.5px] font-semibold text-prisma-accent">Alterar foto</Text>
          </Pressable>
          <Text
            className={`mt-0.5 text-center text-[12px] ${
              flow.fieldErrors.avatar ? "text-prisma-danger" : "text-prisma-faint"
            }`}
          >
            {flow.fieldErrors.avatar ?? "JPG, PNG, GIF ou WebP · máx. 2 MB"}
          </Text>
        </View>

        {flow.error ? (
          <View className="mt-5">
            <Callout tone="danger">{flow.error}</Callout>
          </View>
        ) : null}

        <View className="mt-6 gap-5">
          <Field
            label="Nome completo"
            hint="Exibido no seu perfil e em outras áreas do Prisma."
            error={flow.fieldErrors.full_name}
          >
            <TextField
              icon="user"
              placeholder="Seu nome"
              value={flow.draft.fullName}
              onChangeText={flow.setFullName}
              autoCapitalize="words"
              textContentType="name"
            />
          </Field>

          <Field
            label="Nickname"
            hint="Letras minúsculas, números e underscore."
            error={flow.fieldErrors.username}
          >
            <TextField
              icon="at"
              placeholder="nickname"
              value={flow.draft.username}
              onChangeText={flow.setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              trailing={
                flow.nickStatus === "checking" ? (
                  <ActivityIndicator size="small" color={COLORS.faint} />
                ) : nick ? (
                  <Text className="pr-2 text-[12.5px] font-semibold" style={{ color: nick.color }}>
                    {nick.label}
                  </Text>
                ) : null
              }
            />
          </Field>

          <Field label="Bio" error={flow.fieldErrors.bio}>
            <View className="rounded-2xl border border-prisma-field-border bg-prisma-field px-4 py-3.5">
              <TextInput
                multiline
                placeholder="Conte um pouco sobre você e seus jogos favoritos"
                placeholderTextColor={COLORS.faint}
                selectionColor={COLORS.accent}
                maxLength={BIO_MAX}
                value={flow.draft.bio}
                onChangeText={flow.setBio}
                className="h-[84px] p-0 text-base leading-[23px] text-prisma-body"
                style={{ textAlignVertical: "top" }}
              />
            </View>
            <Text className="mx-0.5 mt-2 text-right text-[12px] text-prisma-faint">
              {flow.draft.bio.length}/{BIO_MAX}
            </Text>
          </Field>
        </View>
      </ScrollView>

      <View className="flex-row gap-2.5 border-t border-white/[0.05] px-6 pb-6 pt-3.5">
        <Pressable
          accessibilityRole="button"
          onPress={flow.close}
          className="h-14 flex-1 items-center justify-center rounded-[18px] border border-white/[0.08] bg-white/[0.06]"
        >
          <Text className="text-[15.5px] font-semibold text-prisma-body">Cancelar</Text>
        </Pressable>
        <View style={{ flex: 1.4 }}>
          <GradientButton
            accessibilityLabel="Salvar alterações"
            label={flow.saving ? "Salvando…" : flow.saved ? "Salvo!" : "Salvar alterações"}
            loading={flow.saving}
            dimmed={!flow.canSave}
            height={56}
            onPress={flow.save}
          />
        </View>
      </View>
    </Sheet>
  );
});

EditProfileSheet.displayName = "EditProfileSheet";
