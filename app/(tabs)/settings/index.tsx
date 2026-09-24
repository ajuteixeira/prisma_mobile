import { SectionLabel, SettingsRow, SettingsSheet } from "@/components/settings";
import { Callout, GradientButton, Icon, PrismaBackground, TextField } from "@/components/ui";
import { COLORS } from "@/constants";
import { useSettings } from "@/hooks";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { memo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

/**
 * Configurações (artboard 6d): lista agrupada estilo iOS sobre os feixes do
 * prisma. Sair e Excluir abrem bottom sheets; o logout chama a API e encerra a
 * sessão local.
 */
export default function SettingsScreen() {
  const flow = useSettings();
  const router = useRouter();

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

        {flow.user ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Abrir perfil"
            onPress={() => router.push("/profile")}
            className="mt-5 flex-row items-center gap-3.5 rounded-[20px] border border-white/[0.06] bg-prisma-surface p-4"
          >
            <Image
              source={{
                uri: `https://api.dicebear.com/7.x/avataaars/svg?seed=${flow.user.username}&backgroundColor=c0aede`,
              }}
              style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: "#c0aede" }}
            />
            <View className="min-w-0 flex-1">
              <Text className="text-[16px] font-bold text-prisma-ink">
                @{flow.user.username}
              </Text>
              <Text className="mt-[3px] text-[12.5px] text-prisma-muted">{flow.user.email}</Text>
            </View>
            <Icon name="chevronRight" size={12} color="#4b5563" />
          </Pressable>
        ) : null}

        {flow.error ? (
          <View className="mt-5">
            <Callout tone="danger">{flow.error}</Callout>
          </View>
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
            onPress={flow.openLogout}
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
            onPress={flow.openDelete}
          />
        </View>
      </ScrollView>

      {/* Sheet: confirmação de logout */}
      <SettingsSheet visible={flow.sheet === "logout"} onClose={flow.close}>
        <View
          className="h-14 w-14 items-center justify-center rounded-[18px]"
          style={{ backgroundColor: "rgba(251, 191, 36, 0.14)" }}
        >
          <Icon name="signOut" size={22} color="#fbbf24" />
        </View>
        <Text className="mt-[18px] text-[22px] font-bold text-white" style={{ letterSpacing: -0.3 }}>
          Sair da conta?
        </Text>
        <Text className="mb-6 mt-2 text-[13.5px] leading-5 text-prisma-muted">
          Sua sessão será encerrada em todos os dispositivos. Você precisará entrar novamente.
        </Text>
        <GradientButton
          label={flow.loading ? "Saindo…" : "Sair"}
          loading={flow.loading}
          onPress={flow.confirmLogout}
        />
        <SheetCancel onPress={flow.close} />
      </SettingsSheet>

      {/* Sheet: exclusão de conta (exige digitar EXCLUIR) */}
      <SettingsSheet visible={flow.sheet === "delete"} onClose={flow.close}>
        <View
          className="h-14 w-14 items-center justify-center rounded-[18px]"
          style={{ backgroundColor: "rgba(239, 68, 68, 0.14)" }}
        >
          <Icon name="alert" size={22} color="#f87171" />
        </View>
        <Text className="mt-[18px] text-[22px] font-bold text-white" style={{ letterSpacing: -0.3 }}>
          Excluir sua conta?
        </Text>
        <Text className="mt-2 text-[13.5px] leading-5 text-prisma-muted">
          Todos os seus dados, conquistas e progresso serão apagados para sempre. Digite{" "}
          <Text className="font-bold text-prisma-danger-text">EXCLUIR</Text> para confirmar.
        </Text>
        <View className="mt-[18px]">
          <TextField
            icon="key"
            placeholder="EXCLUIR"
            value={flow.confirmText}
            onChangeText={flow.setConfirmText}
            autoCapitalize="characters"
            autoCorrect={false}
          />
        </View>
        <View className="mt-4">
          <GradientButton
            label={flow.loading ? "Excluindo…" : "Excluir conta"}
            loading={flow.loading}
            disabled={!flow.deleteConfirmed}
            colors={["#dc2626", "#991b1b"]}
            onPress={flow.confirmDelete}
          />
        </View>
        <SheetCancel onPress={flow.close} />
      </SettingsSheet>

      {/* Sheet: ação concluída */}
      <SettingsSheet visible={flow.sheet === "done"} onClose={flow.finish}>
        {flow.done ? (
          <>
            <View
              className="h-[76px] w-[76px] items-center justify-center self-center rounded-full border-[1.5px]"
              style={{
                backgroundColor: "rgba(16, 185, 129, 0.12)",
                borderColor: "rgba(16, 185, 129, 0.4)",
              }}
            >
              <Icon name="check" size={30} color="#10b981" />
            </View>
            <Text className="mt-[18px] text-center text-[21px] font-bold text-white">
              {flow.done.title}
            </Text>
            <Text className="mb-6 mt-2 text-center text-[13.5px] leading-5 text-prisma-muted">
              {flow.done.text}
            </Text>
            <GradientButton label={flow.done.cta} onPress={flow.finish} />
          </>
        ) : null}
      </SettingsSheet>
    </View>
  );
}

const SheetCancel = memo(({ onPress }: { onPress: () => void }) => (
  <Pressable
    accessibilityRole="button"
    onPress={onPress}
    className="mt-2.5 h-[52px] items-center justify-center"
  >
    <Text className="text-[15px] font-semibold text-prisma-muted">Cancelar</Text>
  </Pressable>
));

SheetCancel.displayName = "SheetCancel";
