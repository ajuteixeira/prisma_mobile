import { profileSchema } from "@/schemas";
import { profileApi, type ProfileCardData, type ProfileUpdatePayload } from "@/services";
import { useSession } from "@/store";
import { describeApiError, fieldErrorMap, pickAvatar, type PickedImage } from "@/utils";
import { useState } from "react";
import { useRequest } from "./_use-request";
import { useUsernameAvailability } from "./_use-username-availability";

type Draft = { fullName: string; username: string; bio: string };

/** Campos que diferem de `initial`, mais a foto nova quando houver. */
const changedFields = (draft: Draft, initial: Draft, photo: PickedImage | null) => {
  const changes: ProfileUpdatePayload = {};
  const fullName = draft.fullName.trim();
  const bio = draft.bio.trim();
  if (fullName !== initial.fullName) changes.full_name = fullName;
  if (draft.username !== initial.username) changes.username = draft.username;
  if (bio !== initial.bio) changes.bio = bio;
  if (photo) changes.avatar = photo.dataUrl;
  return changes;
};

/**
 * Formulário "Editar perfil": rascunho, foto nova e o salvar em
 * `PATCH /api/profile`, que atualiza o usuário da sessão. `onDone` fecha o formulário.
 */
export const useEditProfile = (profile: ProfileCardData, onDone: () => void) => {
  const token = useSession((state) => state.token);
  const user = useSession((state) => state.user);
  const signIn = useSession((state) => state.signIn);

  const initial: Draft = {
    fullName: user?.full_name ?? "",
    username: user?.username ?? profile.username,
    bio: profile.bio ?? "",
  };
  const [draft, setDraft] = useState(initial);
  const [photo, setPhoto] = useState<PickedImage | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const usernameStatus = useUsernameAvailability(draft.username, initial.username);

  const request = useRequest((error) => {
    const errors = fieldErrorMap(error);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return null;
    return describeApiError(error, "Não foi possível salvar. Verifique sua conexão e tente novamente.");
  });

  const canSave =
    !request.loading &&
    profileSchema.safeParse(draft).success &&
    usernameStatus !== "taken" &&
    usernameStatus !== "invalid";

  const pickPhoto = async () => {
    const picked = await pickAvatar();
    if (!picked) return;
    if ("error" in picked) return setFieldErrors((current) => ({ ...current, avatar: picked.error }));
    setFieldErrors(({ avatar: _avatar, ...rest }) => rest);
    setPhoto(picked);
  };

  const save = async () => {
    if (!token || !canSave) return;
    const changes = changedFields(draft, initial, photo);
    if (Object.keys(changes).length === 0) return onDone();

    const response = await request.run(() => profileApi.update(token, changes));
    if (!response) return;
    signIn({ token, user: response.user });
    // "Salvo!" fica visível um instante antes de fechar.
    setSaved(true);
    setTimeout(onDone, 700);
  };

  return {
    draft,
    set: (field: keyof Draft, value: string) =>
      setDraft((current) => ({ ...current, [field]: value })),
    /** Semente do avatar gerado: o nickname salvo, para não mudar a cada tecla. */
    avatarSeed: initial.username,
    avatarUri: photo?.uri ?? profile.avatar_url,
    pickPhoto,
    usernameStatus,
    fieldErrors,
    error: request.error,
    canSave,
    saving: request.loading,
    saved,
    save,
  };
};
