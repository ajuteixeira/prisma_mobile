import { AuthHeader, AuthSheet, CredentialsModal, PlatformCard } from "@/components/auth";
import { Callout, GradientButton, SegmentedBar } from "@/components/ui";
import {
  BEAM_OFF_OPACITY,
  COLORS,
  CONNECT_BEAMS,
  CONNECT_HERO_HEIGHT,
  CONNECT_SCRIM,
  PLATFORMS,
  type Platform,
  type PlatformSlug,
} from "@/constants";
import { usePlatformAccounts, useRequest, useVerificationCodes } from "@/hooks";
import { ApiError } from "@/services";
import { describeApiError, goBackOr } from "@/utils";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";

/** Como no web, desvincular pede confirmação: os dados sincronizados somem. */
const confirmDisconnect = (platform: Platform, onConfirm: () => void) =>
  Alert.alert(
    `Desvincular ${platform.name}?`,
    "Todos os jogos e conquistas sincronizados desta plataforma serão removidos do seu perfil.",
    [
      { text: "Cancelar", style: "cancel" },
      { text: "Desvincular", style: "destructive", onPress: onConfirm },
    ],
  );

/** Vinculação de contas: OAuth no navegador ou formulário de credenciais. */
export default function ConnectPlatformsScreen() {
  const router = useRouter();
  const { accounts, connectInBrowser, connectWithCode, disconnect } = usePlatformAccounts();
  const codes = useVerificationCodes();
  const linking = useRequest();
  const [modal, setModal] = useState<Platform | null>(null);

  const statusOf = (slug: PlatformSlug) => accounts[slug].status;
  const connected = PLATFORMS.filter(({ slug }) => statusOf(slug) === "on").length;
  const busy = PLATFORMS.some(({ slug }) => statusOf(slug) === "loading");

  /** Desvincula a conta vinculada, abre o OAuth ou abre o formulário de credenciais. */
  const toggle = (platform: Platform) => {
    const status = statusOf(platform.slug);
    if (status === "loading") return;
    if (status === "on") return confirmDisconnect(platform, () => disconnect(platform));
    if (platform.authKind === "oauth") return connectInBrowser(platform.slug as "xbox");

    linking.setError(null);
    setModal(platform);
    if (platform.ownershipCode) codes.issue(platform.slug);
  };

  const submitCredentials = async (values: string[]) => {
    if (!modal) return;
    // Steam: a chave segue no `state` assinado; a posse é provada no login OpenID.
    if (modal.slug === "steam") {
      setModal(null);
      return connectInBrowser("steam", values[0]);
    }

    const issued = codes.get(modal.slug);
    if (!issued) return;
    const linked = await linking.run(
      async () => {
        await connectWithCode(modal, values, issued.verification_token);
        return true;
      },
      (error) => {
        // Código expirado: já emite outro para o usuário colar no perfil.
        if (error instanceof ApiError && error.status === 410) codes.issue(modal.slug, true);
        return describeApiError(error);
      },
    );
    if (!linked) return;
    codes.discard(modal.slug);
    setModal(null);
  };

  const finish = () => {
    if (busy || connected === 0) return;
    // TODO(api): disparar a sincronização inicial quando a API expuser a rota.
    router.replace("/profile");
  };

  return (
    <View className="flex-1 bg-prisma-background">
      <StatusBar style="light" />

      <AuthHeader
        title="Vincule suas contas"
        subtitle="Cada plataforma conectada acende sua cor no seu prisma. Dá para vincular o resto depois."
        onBack={() => goBackOr(router, "/")}
        height={CONNECT_HERO_HEIGHT}
        // Cada plataforma vinculada acende seu feixe no topo.
        beams={CONNECT_BEAMS.map((beam) => ({
          ...beam,
          opacity: statusOf(beam.id as PlatformSlug) === "on" ? 1 : BEAM_OFF_OPACITY,
        }))}
        scrim={CONNECT_SCRIM}
      />

      <AuthSheet>
        <View className="mb-3.5 flex-row items-center justify-between gap-4">
          <Text className="text-[13px] font-semibold text-prisma-body">
            {connected === 0
              ? "Nenhuma conta vinculada"
              : `${connected} de ${PLATFORMS.length} contas vinculadas`}
          </Text>
          <SegmentedBar
            colors={PLATFORMS.map(({ slug, color }) => (statusOf(slug) === "on" ? color : COLORS.track))}
            segmentWidth={26}
            gap={4}
          />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ gap: 10, paddingBottom: 2 }}
          showsVerticalScrollIndicator={false}
        >
          {PLATFORMS.map((platform) => (
            <PlatformCard
              key={platform.slug}
              platform={platform}
              {...accounts[platform.slug]}
              onPress={toggle}
            />
          ))}

          <Callout icon="lock">
            O Prisma só lê conquistas e estatísticas públicas. Nunca postamos nem alteramos nada nas
            suas contas.
          </Callout>
        </ScrollView>

        <View className="mt-4">
          <GradientButton
            label={connected > 0 ? "Concluir e sincronizar" : "Vincule ao menos uma conta"}
            dimmed={connected === 0 || busy}
            onPress={finish}
          />
        </View>
      </AuthSheet>

      <CredentialsModal
        key={modal?.slug}
        platform={modal}
        loading={linking.loading}
        error={linking.error ?? codes.error}
        verificationCode={modal ? (codes.get(modal.slug)?.code ?? null) : null}
        codeLoading={codes.loading}
        onRegenerateCode={() => modal && codes.issue(modal.slug, true)}
        onSubmit={submitCredentials}
        onClose={() => {
          if (!linking.loading) setModal(null);
        }}
      />
    </View>
  );
}
