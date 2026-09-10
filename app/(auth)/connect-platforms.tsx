import { AuthHeader, AuthSheet, CredentialsModal, PlatformCard } from "@/components/auth";
import { Callout, GradientButton, SegmentedBar } from "@/components/ui";
import { CONNECT_HERO_HEIGHT, CONNECT_SCRIM } from "@/constants";
import { useConnectPlatforms } from "@/hooks";
import { StatusBar } from "expo-status-bar";
import { ScrollView, Text, View } from "react-native";

export default function ConnectPlatformsScreen() {
  const flow = useConnectPlatforms();

  return (
    <View className="flex-1 bg-prisma-background">
      <StatusBar style="light" />

      <AuthHeader
        title="Vincule suas contas"
        subtitle="Cada plataforma conectada acende sua cor no seu prisma. Dá para vincular o resto depois."
        onBack={flow.goBack}
        height={CONNECT_HERO_HEIGHT}
        beams={flow.beams}
        scrim={CONNECT_SCRIM}
      />

      <AuthSheet>
        <View className="mb-3.5 flex-row items-center justify-between gap-4">
          <Text className="text-[13px] font-semibold text-prisma-body">{flow.counterLabel}</Text>
          <SegmentedBar colors={flow.segments} segmentWidth={26} gap={4} />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ gap: 10, paddingBottom: 2 }}
          showsVerticalScrollIndicator={false}
        >
          {flow.cards.map(({ platform, status, description }) => (
            <PlatformCard
              key={platform.slug}
              platform={platform}
              status={status}
              description={description}
              onPress={flow.toggle}
            />
          ))}

          <Callout icon="lock">
            O Prisma só lê conquistas e estatísticas públicas. Nunca postamos nem alteramos nada nas
            suas contas.
          </Callout>
        </ScrollView>

        <View className="mt-4">
          {/* Sem nenhuma conta o botão fica esmaecido e o toque não faz nada. */}
          <GradientButton
            label={flow.finishLabel}
            loading={flow.finishing}
            dimmed={flow.finishDimmed}
            onPress={flow.finish}
          />
        </View>
      </AuthSheet>

      <CredentialsModal
        platform={flow.modal}
        values={flow.modalValues}
        onChangeField={flow.setField}
        ready={flow.modalReady}
        loading={flow.modalLoading}
        onSubmit={flow.submitModal}
        onClose={flow.closeModal}
      />
    </View>
  );
}
