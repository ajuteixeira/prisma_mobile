import {
  DeleteAccountDialog,
  EditProfileSheet,
  LogoutDialog,
  SectionLabel,
  SettingsRow,
} from "@/components/settings";
import { fallbackAvatar, Icon, PrismaBackground } from "@/components/ui";
import { COLORS } from "@/constants";
import { useProfile } from "@/hooks";
import { useSession } from "@/store";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

/** Configurações (artboard 6d): lista agrupada estilo iOS sobre os feixes do prisma. */
export default function SettingsScreen() {
  const router = useRouter();
  const user = useSession((state) => state.user);
  const { data: profile, reload } = useProfile();
  const [open, setOpen] = useState<"edit" | "logout" | "delete" | null>(null);
  const close = () => setOpen(null);

  return (
    <View className="flex-1 bg-prisma-background">
      <StatusBar style="light" />
      <PrismaBackground />

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-[140px] pt-[58px]"
        showsVerticalScrollIndicator={false}
      >
        <Text
          className="text-[30px] font-extrabold text-prisma-ink"
          style={{ letterSpacing: -1.2 }}
        >
          Configurações
        </Text>

        {user ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Editar perfil"
            onPress={() => setOpen("edit")}
            className="mt-5 flex-row items-center gap-3.5 rounded-[20px] border border-white/[0.06] bg-prisma-surface p-4"
          >
            <Image
              source={{ uri: profile?.avatar_url ?? fallbackAvatar(user.username) }}
              style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: "#c0aede" }}
            />
            <View className="min-w-0 flex-1">
              <Text className="text-[16px] font-bold text-prisma-ink">
                @{user.username}
              </Text>
              <Text className="mt-[3px] text-[12.5px] text-prisma-muted">{user.email}</Text>
            </View>
            <Icon name="chevronRight" size={12} color="#4b5563" />
          </Pressable>
        ) : null}

        <SectionLabel>Conta</SectionLabel>
        <View className="overflow-hidden rounded-[20px] border border-white/[0.06] bg-prisma-surface">
          <View className="border-b border-white/[0.05]">
            <SettingsRow
              icon="link"
              iconColor={COLORS.accent}
              iconBackground="rgba(96, 165, 250, 0.14)"
              title="Contas vinculadas"
              onPress={() => router.push("/connect-platforms")}
            />
          </View>
          <SettingsRow
            icon="key"
            iconColor={COLORS.accent}
            iconBackground="rgba(96, 165, 250, 0.14)"
            title="Alterar senha"
            onPress={() => router.push("/forgot-password")}
          />
        </View>

        <SectionLabel>Sessão</SectionLabel>
        <View className="overflow-hidden rounded-[20px] border border-white/[0.06] bg-prisma-surface">
          <SettingsRow
            icon="signOut"
            iconColor="#fbbf24"
            iconBackground="rgba(251, 191, 36, 0.14)"
            title="Sair da conta"
            subtitle="Encerra a sessão em todos os dispositivos."
            onPress={() => setOpen("logout")}
          />
        </View>

        <SectionLabel color="#f87171">Zona de perigo</SectionLabel>
        <View
          className="overflow-hidden rounded-[20px] border"
          style={{ backgroundColor: "rgba(239, 68, 68, 0.06)", borderColor: "rgba(239, 68, 68, 0.2)" }}
        >
          <SettingsRow
            icon="trash"
            iconColor="#f87171"
            iconBackground="rgba(239, 68, 68, 0.16)"
            title="Excluir conta permanentemente"
            titleColor="#fca5a5"
            subtitle="Apaga dados, conquistas e progresso. Irreversível."
            onPress={() => setOpen("delete")}
          />
        </View>
      </ScrollView>

      <EditProfileSheet
        visible={open === "edit"}
        profile={profile}
        onClose={close}
        onSaved={() => {
          close();
          reload();
        }}
      />
      <LogoutDialog visible={open === "logout"} onClose={close} />
      <DeleteAccountDialog visible={open === "delete"} onClose={close} />
    </View>
  );
}
