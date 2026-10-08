import * as ImagePicker from "expo-image-picker";

const AVATAR_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const AVATAR_MAX_BYTES = 2_000_000;

/** Tamanho real de um conteúdo em base64 (cada 4 caracteres viram 3 bytes). */
const base64Bytes = (base64: string) =>
  Math.floor((base64.length * 3) / 4) - (base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0);

export type PickedImage = { uri: string; dataUrl: string };

/**
 * Abre a galeria para a foto de perfil, recortada em quadrado. `null` quando o
 * usuário cancela; `{ error }` quando a foto não passa nos limites da API.
 */
export const pickAvatar = async (): Promise<PickedImage | { error: string } | null> => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
    base64: true,
  });
  const asset = result.canceled ? undefined : result.assets[0];
  if (!asset?.base64) return null;

  const type = asset.mimeType ?? "image/jpeg";
  if (!AVATAR_TYPES.includes(type)) return { error: "Use uma foto JPG, PNG, GIF ou WebP." };
  if (base64Bytes(asset.base64) > AVATAR_MAX_BYTES)
    return { error: "A foto deve ter no máximo 2 MB." };

  return { uri: asset.uri, dataUrl: `data:${type};base64,${asset.base64}` };
};
