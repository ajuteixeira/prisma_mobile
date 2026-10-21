import { ProfileView } from "@/components/profile";
import { IconButton } from "@/components/ui";
import { useSession } from "@/store";
import { goBackOr } from "@/utils";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { View } from "react-native";

/**
 * Perfil de outra pessoa, só leitura, como a página `/:username` da web. O
 * próprio username abre a aba Perfil.
 */
export default function UserProfileScreen() {
  const router = useRouter();
  const token = useSession((state) => state.token);
  const ownUsername = useSession((state) => state.user?.username);
  const { username } = useLocalSearchParams<{ username: string }>();

  if (!token) return <Redirect href="/login" />;
  if (!username || username.toLowerCase() === ownUsername?.toLowerCase()) {
    return <Redirect href="/profile" />;
  }

  return (
    <ProfileView
      key={username}
      username={username}
      header={
        <View className="mb-3 flex-row">
          <IconButton
            icon="back"
            variant="ghost"
            accessibilityLabel="Voltar"
            onPress={() => goBackOr(router, "/followers")}
          />
        </View>
      }
    />
  );
}
