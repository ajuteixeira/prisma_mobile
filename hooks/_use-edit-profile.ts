import { ApiError, authService, profileService, type ProfileUpdatePayload } from "@/services";
import { useSession } from "@/store";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useEffect, useRef, useState } from "react";

/** Mesmos limites da web (`ProfileCardLive`) e do `PATCH /api/profile`. */
export const BIO_MAX = 90;
const FULL_NAME_MIN = 3;
const AVATAR_MAX_BYTES = 2_000_000;
const AVATAR_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,50}$/;
const AVAILABILITY_DEBOUNCE = 400;

/** Situação do nickname digitado, exibida à direita do campo. */
export type NickStatus = "idle" | "checking" | "available" | "taken" | "invalid";

type Draft = {
  fullName: string;
  username: string;
  bio: string;
  /** Pré-visualização da foto (data URL do servidor ou arquivo local). */
  avatarUri: string | null;
  /** Data URL da foto nova, enviado só quando o usuário escolhe outra. */
  avatarData: string | null;
};

const EMPTY_DRAFT: Draft = { fullName: "", username: "", bio: "", avatarUri: null, avatarData: null };

/** Tamanho real de um conteúdo em base64 (cada 4 caracteres viram 3 bytes). */
const base64Bytes = (base64: string) =>
  Math.floor((base64.length * 3) / 4) - (base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0);

/**
 * Sheet "Editar perfil" de Ajustes (artboard 6d). Ao abrir, busca bio e foto em
 * `GET /api/profile`; ao salvar, manda só o que mudou para `PATCH /api/profile`
 * e atualiza o usuário da sessão.
 */
export const useEditProfile = () => {
  const token = useSession((state) => state.token);
  const user = useSession((state) => state.user);
  const signIn = useSession((state) => state.signIn);

  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [nickStatus, setNickStatus] = useState<NickStatus>("idle");
  const [initial, setInitial] = useState<Draft>(EMPTY_DRAFT);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  /** Foto atual do perfil, para o card de Ajustes refletir o que foi salvo. */
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  const open = useCallback(async () => {
    if (!token || !user) return;
    const base: Draft = {
      fullName: user.full_name ?? "",
      username: user.username,
      bio: "",
      avatarUri: avatarUrl,
      avatarData: null,
    };
    setInitial(base);
    setDraft(base);
    setError(null);
    setFieldErrors({});
    setNickStatus("idle");
    setSaved(false);
    setVisible(true);
    setLoading(true);

    try {
      const { profile } = await profileService.me(token);
      const loaded = { ...base, bio: profile.bio ?? "", avatarUri: profile.avatar_url };
      setAvatarUrl(profile.avatar_url);
      setInitial(loaded);
      setDraft(loaded);
    } catch {
      setError("Não foi possível carregar seu perfil.");
    } finally {
      setLoading(false);
    }
  }, [token, user, avatarUrl]);

  const close = useCallback(() => {
    if (saving) return;
    setVisible(false);
  }, [saving]);

  const setFullName = useCallback((fullName: string) => {
    setDraft((current) => ({ ...current, fullName }));
  }, []);

  /** Como no protótipo: minúsculas, e o que não for a-z, 0-9 ou _ vira _. */
  const setUsername = useCallback((value: string) => {
    const username = value.toLowerCase().replace(/[^a-z0-9_]/g, "_");
    setDraft((current) => ({ ...current, username }));
  }, []);

  const setBio = useCallback((value: string) => {
    setDraft((current) => ({ ...current, bio: value.slice(0, BIO_MAX) }));
  }, []);

  // Confere o nickname novo na API depois de uma pausa na digitação.
  useEffect(() => {
    if (!visible) return;
    const { username } = draft;
    if (username.toLowerCase() === initial.username.toLowerCase()) {
      setNickStatus("idle");
      return;
    }
    if (!USERNAME_PATTERN.test(username)) {
      setNickStatus("invalid");
      return;
    }

    setNickStatus("checking");
    let active = true;
    const timer = setTimeout(async () => {
      try {
        const result = await authService.availability({ username });
        if (active) setNickStatus(result.username === false ? "taken" : "available");
      } catch {
        // Sem resposta, o servidor confere de novo ao salvar.
        if (active) setNickStatus("idle");
      }
    }, AVAILABILITY_DEBOUNCE);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [visible, draft.username, initial.username]);

  const pickPhoto = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });
    if (result.canceled) return;

    const asset = result.assets[0];
    const type = asset?.mimeType ?? "image/jpeg";
    if (!asset?.base64) return;

    if (!AVATAR_TYPES.includes(type)) {
      setFieldErrors((current) => ({ ...current, avatar: "Use uma foto JPG, PNG, GIF ou WebP." }));
      return;
    }
    if (base64Bytes(asset.base64) > AVATAR_MAX_BYTES) {
      setFieldErrors((current) => ({ ...current, avatar: "A foto deve ter no máximo 2 MB." }));
      return;
    }

    setFieldErrors(({ avatar: _avatar, ...rest }) => rest);
    setDraft((current) => ({
      ...current,
      avatarUri: asset.uri,
      avatarData: `data:${type};base64,${asset.base64}`,
    }));
  }, []);

  const canSave =
    !loading &&
    !saving &&
    draft.fullName.trim().length >= FULL_NAME_MIN &&
    USERNAME_PATTERN.test(draft.username) &&
    nickStatus !== "taken" &&
    nickStatus !== "invalid";

  const save = useCallback(async () => {
    if (!token || !canSave) return;

    const payload: ProfileUpdatePayload = {};
    const fullName = draft.fullName.trim();
    const bio = draft.bio.trim();
    if (fullName !== initial.fullName) payload.full_name = fullName;
    if (draft.username !== initial.username) payload.username = draft.username;
    if (bio !== initial.bio) payload.bio = bio;
    if (draft.avatarData) payload.avatar = draft.avatarData;

    if (Object.keys(payload).length === 0) {
      setVisible(false);
      return;
    }

    setSaving(true);
    setError(null);
    setFieldErrors({});

    try {
      const response = await profileService.update(token, payload);
      signIn({ token, user: response.user });
      setAvatarUrl(response.profile.avatar_url);
      setSaved(true);
      closeTimer.current = setTimeout(() => {
        setVisible(false);
        setSaved(false);
      }, 700);
    } catch (requestError) {
      if (requestError instanceof ApiError && Object.keys(requestError.fieldErrors).length > 0) {
        setFieldErrors(
          Object.fromEntries(
            Object.entries(requestError.fieldErrors).map(([field, messages]) => [field, messages[0]]),
          ),
        );
      } else {
        setError(
          requestError instanceof ApiError && requestError.status === 401
            ? "Sua sessão expirou. Entre novamente."
            : "Não foi possível salvar. Verifique sua conexão e tente novamente.",
        );
      }
    } finally {
      setSaving(false);
    }
  }, [token, canSave, draft, initial, signIn]);

  return {
    visible,
    loading,
    saving,
    saved,
    error,
    fieldErrors,
    nickStatus,
    draft,
    /** Semente do avatar gerado: o nickname salvo, para não mudar a cada tecla. */
    avatarSeed: initial.username,
    avatarUrl,
    canSave,
    open,
    close,
    setFullName,
    setUsername,
    setBio,
    pickPhoto,
    save,
  };
};
