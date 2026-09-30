import { ProfileCard } from "@/components/profile";
import { Callout, PrismaBackground } from "@/components/ui";
import { COLORS, PROFILE_BEAMS, PROFILE_HERO_HEIGHT } from "@/constants";
import { useProfileCard } from "@/hooks";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";

/**
 * Perfil (artboard 6a), primeira aba após o login. Por ora só o cartão de
 * perfil; jogado recentemente, estatísticas e distribuição de troféus entram
 * depois, abaixo dele.
 */
export default function ProfileScreen() {
  const card = useProfileCard();

  return (
    <View className="flex-1 bg-prisma-background">
      <StatusBar style="light" />

      <View
        pointerEvents="none"
        className="absolute left-0 right-0 top-0 overflow-hidden"
        style={{ height: PROFILE_HERO_HEIGHT }}
      >
        <PrismaBackground beams={PROFILE_BEAMS} scrim="transparent" />
        <LinearGradient
          colors={["rgba(10, 14, 20, 0.55)", COLORS.background]}
          style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
        />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-[120px] pt-[64px]"
        showsVerticalScrollIndicator={false}
      >
        {card.profile ? (
          <ProfileCard
            profile={card.profile}
            onShare={card.share}
            onPressFollowers={card.openFollowers}
            onPressFollowing={card.openFollowing}
          />
        ) : card.error ? (
          <View className="gap-3">
            <Callout tone="danger">{card.error}</Callout>
            <Pressable
              accessibilityRole="button"
              onPress={card.reload}
              className="h-11 items-center justify-center self-start rounded-xl border border-white/[0.08] bg-white/[0.06] px-4"
            >
              <Text className="text-[14px] font-semibold text-prisma-body">Tentar novamente</Text>
            </Pressable>
          </View>
        ) : (
          <View
            accessibilityLabel="Carregando perfil"
            className="h-[300px] items-center justify-center rounded-3xl border border-white/[0.06] bg-prisma-surface"
          >
            <ActivityIndicator color={COLORS.accent} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}
