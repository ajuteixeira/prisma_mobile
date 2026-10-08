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
import { useEditProfile } from "@/hooks/_use-edit-profile";
import type { UsernameStatus } from "@/hooks/_use-username-availability";
import { BIO_MAX } from "@/schemas";
import type { ProfileCardData } from "@/services";
import { sanitizeUsername } from "@/utils";
import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";

const USERNAME_STATUS: Record<UsernameStatus, { label: string; color: string } | null> = {
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

type EditProfileFormProps = {
  profile: ProfileCardData;
  onClose: () => void;
  onSaved: () => void;
};

/** Conteúdo da sheet: monta a cada abertura, então começa sempre do perfil salvo. */
const EditProfileForm = ({ profile, onClose, onSaved }: EditProfileFormProps) => {
  const form = useEditProfile(profile, onSaved);
  const status = USERNAME_STATUS[form.usernameStatus];

  return (
    <>
      <View className="flex-row items-center justify-between pb-2 pl-6 pr-5 pt-[22px]">
        <Text className="text-[21px] font-bold text-white" style={{ letterSpacing: -0.3 }}>
          Editar perfil
        </Text>
        <IconButton
          icon="close"
          variant="ghost"
          color={COLORS.muted}
          accessibilityLabel="Fechar edição"
          onPress={onClose}
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
            onPress={form.pickPhoto}
          >
            <SpectrumAvatar
              username={form.avatarSeed}
              uri={form.avatarUri}
              size={104}
              badge={CameraBadge}
            />
          </Pressable>
          <Pressable accessibilityRole="button" onPress={form.pickPhoto} className="mt-3.5 px-2.5 py-1.5">
            <Text className="text-[14.5px] font-semibold text-prisma-accent">Alterar foto</Text>
          </Pressable>
          <Text
            className={`mt-0.5 text-center text-[12px] ${
              form.fieldErrors.avatar ? "text-prisma-danger" : "text-prisma-faint"
            }`}
          >
            {form.fieldErrors.avatar ?? "JPG, PNG, GIF ou WebP · máx. 2 MB"}
          </Text>
        </View>

        {form.error ? (
          <View className="mt-5">
            <Callout tone="danger">{form.error}</Callout>
          </View>
        ) : null}

        <View className="mt-6 gap-5">
          <Field
            label="Nome completo"
            hint="Exibido no seu perfil e em outras áreas do Prisma."
            error={form.fieldErrors.full_name}
          >
            <TextField
              icon="user"
              placeholder="Seu nome"
              value={form.draft.fullName}
              onChangeText={(value) => form.set("fullName", value)}
              autoCapitalize="words"
              textContentType="name"
            />
          </Field>

          <Field
            label="Nickname"
            hint="Letras minúsculas, números e underscore."
            error={form.fieldErrors.username}
          >
            <TextField
              icon="at"
              placeholder="nickname"
              value={form.draft.username}
              onChangeText={(value) => form.set("username", sanitizeUsername(value))}
              autoCapitalize="none"
              autoCorrect={false}
              trailing={
                form.usernameStatus === "checking" ? (
                  <ActivityIndicator size="small" color={COLORS.faint} />
                ) : status ? (
                  <Text className="pr-2 text-[12.5px] font-semibold" style={{ color: status.color }}>
                    {status.label}
                  </Text>
                ) : null
              }
            />
          </Field>

          <Field label="Bio" error={form.fieldErrors.bio}>
            <View className="rounded-2xl border border-prisma-field-border bg-prisma-field px-4 py-3.5">
              <TextInput
                multiline
                placeholder="Conte um pouco sobre você e seus jogos favoritos"
                placeholderTextColor={COLORS.faint}
                selectionColor={COLORS.accent}
                maxLength={BIO_MAX}
                value={form.draft.bio}
                onChangeText={(value) => form.set("bio", value.slice(0, BIO_MAX))}
                className="h-[84px] p-0 text-base leading-[23px] text-prisma-body"
                style={{ textAlignVertical: "top" }}
              />
            </View>
            <Text className="mx-0.5 mt-2 text-right text-[12px] text-prisma-faint">
              {form.draft.bio.length}/{BIO_MAX}
            </Text>
          </Field>
        </View>
      </ScrollView>

      <View className="flex-row gap-2.5 border-t border-white/[0.05] px-6 pb-6 pt-3.5">
        <Pressable
          accessibilityRole="button"
          onPress={onClose}
          disabled={form.saving}
          className="h-14 flex-1 items-center justify-center rounded-[18px] border border-white/[0.08] bg-white/[0.06]"
        >
          <Text className="text-[15.5px] font-semibold text-prisma-body">Cancelar</Text>
        </Pressable>
        <View style={{ flex: 1.4 }}>
          <GradientButton
            accessibilityLabel="Salvar alterações"
            label={form.saving ? "Salvando…" : form.saved ? "Salvo!" : "Salvar alterações"}
            loading={form.saving}
            dimmed={!form.canSave}
            height={56}
            onPress={form.save}
          />
        </View>
      </View>
    </>
  );
};

type EditProfileSheetProps = {
  visible: boolean;
  /** Perfil salvo; enquanto carrega, a sheet mostra só o indicador. */
  profile: ProfileCardData | null;
  onClose: () => void;
  onSaved: () => void;
};

/** Sheet alta "Editar perfil": foto com o anel do espectro, nome, nickname e bio. */
export const EditProfileSheet = ({ visible, profile, onClose, onSaved }: EditProfileSheetProps) => (
  <Sheet visible={visible} onClose={onClose} heightRatio={0.92} className="overflow-hidden">
    {profile ? (
      <EditProfileForm profile={profile} onClose={onClose} onSaved={onSaved} />
    ) : (
      <ActivityIndicator className="flex-1" color={COLORS.accent} />
    )}
  </Sheet>
);
