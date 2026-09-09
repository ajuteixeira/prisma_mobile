import { AuthHeader, AuthSheet, CodeStep, EmailStep, PasswordStep, SuccessStep } from "@/components/auth";
import { Callout, GradientButton } from "@/components/ui";
import { useForgotPassword } from "@/hooks";
import { StatusBar } from "expo-status-bar";
import { AnimatePresence, MotiView } from "moti";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";

export default function ForgotPasswordScreen() {
  const flow = useForgotPassword();

  return (
    <View className="flex-1 bg-prisma-background">
      <StatusBar style="light" />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <AuthHeader title={flow.title} subtitle={flow.subtitle} onBack={flow.goBack} />

        <AuthSheet>
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1, paddingTop: 26 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Um passo por vez, sempre dentro do mesmo sheet. */}
            <AnimatePresence exitBeforeEnter>
              <MotiView
                key={flow.step}
                from={{ opacity: 0, translateY: 12 }}
                animate={{ opacity: 1, translateY: 0 }}
                exit={{ opacity: 0, translateY: -12 }}
                transition={{ type: "timing", duration: 220 }}
              >
                {flow.step === "email" ? (
                  <EmailStep
                    email={flow.email}
                    onChangeEmail={flow.setEmail}
                    onSubmit={flow.submit}
                  />
                ) : null}

                {flow.step === "code" ? (
                  <CodeStep
                    code={flow.code}
                    onChangeCode={flow.setCode}
                    onComplete={flow.submit}
                    resendLabel={flow.resendLabel}
                    canResend={flow.canResend}
                    onResend={flow.resendCode}
                  />
                ) : null}

                {flow.step === "password" ? (
                  <PasswordStep
                    password={flow.password}
                    onChangePassword={flow.setPassword}
                    passwordConfirmation={flow.passwordConfirmation}
                    onChangePasswordConfirmation={flow.setPasswordConfirmation}
                    visible={flow.passwordVisible}
                    onToggleVisibility={flow.togglePasswordVisibility}
                    passwordsMatch={flow.passwordsMatch}
                    onSubmit={flow.submit}
                  />
                ) : null}

                {flow.step === "success" ? <SuccessStep /> : null}
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
              onPress={flow.submit}
            />

            <Text className="mt-[18px] text-center text-sm text-prisma-muted">
              Lembrou a senha?{" "}
              <Text
                className="font-semibold text-prisma-accent"
                accessibilityRole="link"
                onPress={flow.leaveToSignIn}
              >
                Entrar
              </Text>
            </Text>
          </ScrollView>
        </AuthSheet>
      </KeyboardAvoidingView>
    </View>
  );
}
