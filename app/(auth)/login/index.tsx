import { AuthPrompt, AuthScreen, AuthSpacer, LoginForm, LoginHero } from "@/components/auth";
import { FormError, GradientButton } from "@/components/ui";
import { useRequest } from "@/hooks";
import { loginSchema, validate } from "@/schemas";
import { ApiError, authApi } from "@/services";
import { useSession } from "@/store";
import { describeApiError } from "@/utils";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { useState } from "react";

/** `401` não diz qual campo falhou, para não revelar se o e-mail tem conta. */
const describeLoginError = (error: unknown) =>
  error instanceof ApiError && error.status === 401
    ? "E-mail ou senha incorretos."
    : describeApiError(error);

export default function LoginScreen() {
  const router = useRouter();
  const signIn = useSession((state) => state.signIn);
  const request = useRequest(describeLoginError);
  const [form, setForm] = useState({ email: "", password: "" });
  const credentials = validate(loginSchema, form);

  const edit = (changes: Partial<typeof form>) => {
    request.setError(null);
    setForm((current) => ({ ...current, ...changes }));
  };

  const submit = async () => {
    if (!credentials.data) return request.setError(credentials.error);
    const session = await request.run(() => authApi.login(credentials.data));
    if (!session) return;
    signIn(session);
    router.replace("/profile");
  };

  return (
    <AuthScreen header={<LoginHero />} contentTop={24}>
      <MotiView
        from={{ opacity: 0, translateY: 12 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 550 }}
      >
        <LoginForm
          email={form.email}
          onChangeEmail={(email) => edit({ email })}
          password={form.password}
          onChangePassword={(password) => edit({ password })}
          onForgotPassword={() => router.push("/forgot-password")}
          onSubmit={submit}
        />
        <FormError message={request.error} />
        <GradientButton
          label={request.loading ? "Entrando…" : "Entrar"}
          loading={request.loading}
          dimmed={credentials.error !== null}
          onPress={submit}
        />
      </MotiView>

      <AuthSpacer />
      <AuthPrompt
        question="Não tem uma conta?"
        action="Cadastre-se"
        onPress={() => router.push("/register")}
      />
    </AuthScreen>
  );
}
