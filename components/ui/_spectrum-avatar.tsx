import { COLORS } from "@/constants";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { memo, type ReactNode } from "react";
import { View } from "react-native";

/**
 * Anel do espectro em volta do avatar. O protótipo usa `conic-gradient`, que o
 * React Native não tem; um gradiente diagonal com as mesmas paradas chega perto.
 */
const SPECTRUM = ["#0070cc", "#66c0f4", "#107c10", "#d4a017"] as const;

/** Mesmo avatar gerado que a web usa quando o perfil não enviou foto. */
export const fallbackAvatar = (username: string) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}&backgroundColor=c0aede`;

type SpectrumAvatarProps = {
  username: string;
  /** Foto enviada (data URL ou arquivo local); sem ela, o avatar gerado. */
  uri: string | null;
  size: number;
  /** Selo no canto inferior direito — ponto online no Perfil, câmera na edição. */
  badge?: ReactNode;
};

/** Avatar com o anel do espectro (artboards 6a e 6d). */
export const SpectrumAvatar = memo(({ username, uri, size, badge }: SpectrumAvatarProps) => (
  <View style={{ width: size, height: size }}>
    <LinearGradient
      colors={SPECTRUM}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1, borderRadius: size / 2, padding: 3 }}
    >
      <Image
        source={{ uri: uri ?? fallbackAvatar(username) }}
        accessibilityLabel={`Avatar de ${username}`}
        style={{
          flex: 1,
          borderRadius: size / 2,
          borderWidth: 3,
          borderColor: COLORS.surface,
          backgroundColor: "#c0aede",
        }}
      />
    </LinearGradient>
    {badge}
  </View>
));

SpectrumAvatar.displayName = "SpectrumAvatar";
