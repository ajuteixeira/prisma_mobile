import {
  AuthHeader,
  AuthSheet,
  IdentityStep,
  RegisterEmailStep,
  RegisterPasswordStep,
} from "@/components/auth";
import { Callout, GradientButton } from "@/components/ui";
import { useRegister } from "@/hooks";
import { StatusBar } from "expo-status-bar";
import { AnimatePresence, MotiView } from "moti";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";

export default function RegisterScreen() {
  const flow = useRegister();

  return (
    <View className="flex-1 bg-prisma-background">
      <StatusBar style="light" />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <AuthHeader
          title={flow.title}
          subtitle={flow.subtitle}
          onBack={flow.goBack}
          stepLabel={flow.stepLabel}
          progress={flow.progress}
        />

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
                {flow.step === "identity" ? (
                  <IdentityStep
                    fullName={flow.fullName}
                    onChangeFullName={flow.setFullName}
                    username={flow.username}
                    onChangeUsername={flow.setUsername}
                    onSubmit={flow.submit}
                  />
                ) : null}

                {flow.step === "email" ? (
                  <RegisterEmailStep
                    email={flow.email}
                    onChangeEmail={flow.setEmail}
                    onSubmit={flow.submit}
                  />
                ) : null}

                {flow.step === "password" ? (
                  <RegisterPasswordStep
                    password={flow.password}
                    onChangePassword={flow.setPassword}
                    passwordConfirmation={flow.passwordConfirmation}
                    onChangePasswordConfirmation={flow.setPasswordConfirmation}
                    visible={flow.passwordVisible}
                    onToggleVisibility={flow.togglePasswordVisibility}
                    passwordsMatch={flow.passwordsMatch}
                    strength={flow.strength}
                    onSubmit={flow.submit}
                  />
                ) : null}
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

            {/* Passo incompleto esmaece o botão, mas o toque revela o erro. */}
            <GradientButton
              label={flow.buttonLabel}
              loading={flow.loading}
              dimmed={flow.dimmed}
              onPress={flow.submit}
            />

            <Text className="mt-[18px] text-center text-sm text-prisma-muted">
              Já tem uma conta?{" "}
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
