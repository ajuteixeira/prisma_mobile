import {
  AuthHeader,
  AuthPrompt,
  AuthScreen,
  AuthSpacer,
  EmailStep,
  SentStep,
} from "@/components/auth";
import { FormError, GradientButton, StepTransition } from "@/components/ui";
import { useCountdown, useRequest } from "@/hooks";
import { emailSchema, validate } from "@/schemas";
import { authApi } from "@/services";
import { goBackOr } from "@/utils";
import { useRouter } from "expo-router";
import { useState } from "react";

/** A API aceita 5 pedidos a cada 5 min por e-mail; a espera evita estourar o limite. */
const RESEND_SECONDS = 60;

const COPY = {
  email: {
    title: "Esqueceu a senha?",
    subtitle: "Informe o e-mail da conta e enviaremos um link para criar uma nova senha.",
    button: "Enviar link",
  },
  sent: {
    title: "Confira seu e-mail",
    subtitle: "A nova senha é criada pelo navegador, no link que acabamos de enviar.",
    button: "Voltar para o login",
  },
};

/**
 * Recuperação de senha em dois passos no mesmo sheet. A API responde igual
 * exista ou não a conta, por isso "enviado" nunca confirma o cadastro.
 */
export default function ForgotPasswordScreen() {
  const router = useRouter();
  const countdown = useCountdown(RESEND_SECONDS);
  const request = useRequest();
  const [step, setStep] = useState<keyof typeof COPY>("email");
  const [email, setEmail] = useState("");
  const parsed = validate(emailSchema, email);

  const leave = () => goBackOr(router, "/");

  /** Envia (ou reenvia) o link e liga a contagem do reenvio. */
  const sendLink = async () => {
    if (!parsed.data) return request.setError(parsed.error);
    const sent = await request.run(() => authApi.forgotPassword({ email: parsed.data }));
    if (!sent) return;
    countdown.start();
    setStep("sent");
  };

  /** No passo "enviado", voltar permite corrigir um e-mail digitado errado. */
  const goBack = () => {
    if (step === "email") return leave();
    request.setError(null);
    countdown.reset();
    setStep("email");
  };

  return (
    <AuthScreen
      header={<AuthHeader title={COPY[step].title} subtitle={COPY[step].subtitle} onBack={goBack} />}
    >
      <StepTransition step={step}>
        {step === "email" ? (
          <EmailStep
            email={email}
            onChangeEmail={(value) => {
              request.setError(null);
              setEmail(value);
            }}
            onSubmit={sendLink}
          />
        ) : (
          <SentStep
            email={email}
            resendIn={countdown.remaining}
            resending={request.loading}
            onResend={sendLink}
          />
        )}
      </StepTransition>

      <AuthSpacer />
      <FormError message={request.error} />
      <GradientButton
        label={request.loading && step === "email" ? "Enviando…" : COPY[step].button}
        loading={request.loading && step === "email"}
        dimmed={step === "email" && parsed.error !== null}
        onPress={step === "email" ? sendLink : leave}
      />
      {step === "email" ? (
        <AuthPrompt question="Lembrou a senha?" action="Entrar" onPress={leave} />
      ) : null}
    </AuthScreen>
  );
}
