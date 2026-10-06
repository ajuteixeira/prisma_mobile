import { AuthHeader, AuthSheet, CodeStep, VerifiedStep } from "@/components/auth";
import { Callout, GradientButton, Icon } from "@/components/ui";
import { VERIFICATION_CODE_LENGTH, useVerifyEmail } from "@/hooks";
import { Redirect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AnimatePresence, MotiView } from "moti";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";

export default function VerifyEmailScreen() {
  const flow = useVerifyEmail();

  if (flow.missingRegistration) return <Redirect href="/register" />;

  return (
    <View className="flex-1 bg-prisma-background">
      <StatusBar style="light" />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <AuthHeader
          title="Verifique seu e-mail"
          subtitle="Falta pouco para entrar na comunidade Prisma."
          onBack={flow.goBack}
          stepLabel="CONFIRMAÇÃO"
        />

        <AuthSheet>
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1, paddingTop: 26 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <AnimatePresence exitBeforeEnter>
              <MotiView
                key={flow.step}
                from={{ opacity: 0, translateY: 12 }}
                animate={{ opacity: 1, translateY: 0 }}
                exit={{ opacity: 0, translateY: -12 }}
                transition={{ type: "timing", duration: 220 }}
              >
                {flow.step === "code" ? (
                  <CodeStep
                    email={flow.email}
                    code={flow.code}
                    onChangeCode={flow.setCode}
                    codeLength={VERIFICATION_CODE_LENGTH}
                    invalid={flow.codeInvalid}
                    resendLabel={flow.resendLabel}
                    canResend={flow.canResend}
                    onResend={flow.resendCode}
                  />
                ) : (
                  <VerifiedStep />
                )}
              </MotiView>
            </AnimatePresence>

            {/* Empurra o botão para a base do sheet. */}
            <View className="flex-1" />

            {flow.error ? (
              <MotiView
                from={{ opacity: 0, translateY: -6 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "timing", duration: 180 }}
                className="mb-3"
              >
                <Callout tone="danger">{flow.error}</Callout>
              </MotiView>
            ) : null}

            <GradientButton
              label={flow.buttonLabel}
              loading={flow.loading}
              dimmed={flow.dimmed}
              onPress={flow.submit}
            />

            {flow.goBack ? (
              <Pressable
                accessibilityRole="link"
                onPress={flow.goBack}
                hitSlop={8}
                className="mt-[18px] flex-row items-center justify-center gap-1.5"
              >
                <Icon name="back" size={12} />
                <Text className="text-sm font-semibold text-prisma-accent">
                  Voltar e alterar dados
                </Text>
              </Pressable>
            ) : null}
          </ScrollView>
        </AuthSheet>
      </KeyboardAvoidingView>
    </View>
  );
}
