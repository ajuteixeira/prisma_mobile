import { AuthSheet, LoginForm, LoginHero } from "@/components/auth";
import { Callout, GradientButton } from "@/components/ui";
import { useLogin } from "@/hooks";
import { StatusBar } from "expo-status-bar";
import { MotiView } from "moti";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";

export default function LoginScreen() {
  const flow = useLogin();

  return (
    <View className="flex-1 bg-prisma-background">
      <StatusBar style="light" />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <LoginHero />

        <AuthSheet>
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1, paddingTop: 24 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <MotiView
              from={{ opacity: 0, translateY: 12 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 550 }}
            >
              <LoginForm
                email={flow.email}
                onChangeEmail={flow.setEmail}
                password={flow.password}
                onChangePassword={flow.setPassword}
                passwordVisible={flow.passwordVisible}
                onTogglePasswordVisibility={flow.togglePasswordVisibility}
                onForgotPassword={flow.goToForgotPassword}
                onSubmit={flow.submit}
              />

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

              {/* Campos incompletos esmaecem o botão, mas o toque revela o erro. */}
              <GradientButton
                label={flow.buttonLabel}
                loading={flow.loading}
                dimmed={flow.dimmed}
                onPress={flow.submit}
              />
            </MotiView>

            {/* Empurra o convite de cadastro para a base do sheet. */}
            <View className="flex-1" />

            <Text className="mt-[18px] text-center text-sm text-prisma-muted">
              Não tem uma conta?{" "}
              <Text
                className="font-semibold text-prisma-accent"
                accessibilityRole="link"
                onPress={flow.goToRegister}
              >
                Cadastre-se
              </Text>
            </Text>
          </ScrollView>
        </AuthSheet>
      </KeyboardAvoidingView>
    </View>
  );
}
