import { ApiError, authService } from "@/services";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatCountdown, useCountdown } from "./_use-countdown";

export type ForgotPasswordStep = "email" | "sent";

/** A API aceita 5 pedidos a cada 5 min por e-mail; a espera evita estourar o limite. */
const RESEND_SECONDS = 60;
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i;

const COPY: Record<ForgotPasswordStep, { title: string; subtitle: string; button: string }> = {
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

const describeForgotPasswordError = (error: unknown) =>
  error instanceof ApiError
    ? error.message
    : "Não foi possível conectar ao servidor. Tente novamente.";

/**
 * Máquina de estados da recuperação de senha: e-mail → link enviado, no mesmo
 * sheet. O envio chama `POST /api/auth/password/forgot`, que responde igual
 * exista ou não a conta — por isso o passo "enviado" nunca confirma o cadastro.
 */
export const useForgotPassword = () => {
  const router = useRouter();
  const { remaining, running, start: startCountdown, reset: resetCountdown } =
    useCountdown(RESEND_SECONDS);

  const [step, setStep] = useState<ForgotPasswordStep>("email");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  /** Evita `setState` depois que a tela saiu da pilha no meio da requisição. */
  const mounted = useRef(true);
  useEffect(
    () => () => {
      mounted.current = false;
    },
    [],
  );

  /** Envia o link e liga a contagem do reenvio; devolve se deu certo. */
  const requestLink = useCallback(async () => {
    setError(null);
    try {
      await authService.forgotPassword({ email: email.trim() });
      if (mounted.current) startCountdown();
      return true;
    } catch (requestError) {
      if (mounted.current) setError(describeForgotPasswordError(requestError));
      return false;
    }
  }, [email, startCountdown]);

  const emailValid = useMemo(() => EMAIL_PATTERN.test(email.trim()), [email]);

  const changeEmail = useCallback((value: string) => {
    setError(null);
    setEmail(value);
  }, []);

  const leaveToSignIn = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  }, [router]);

  const submit = useCallback(async () => {
    if (loading) return;

    if (step === "sent") {
      leaveToSignIn();
      return;
    }

    if (!emailValid) {
      setError("Digite um e-mail válido.");
      return;
    }

    setLoading(true);
    const sent = await requestLink();
    if (!mounted.current) return;
    setLoading(false);
    if (sent) setStep("sent");
  }, [emailValid, leaveToSignIn, loading, requestLink, step]);

  const resendLink = useCallback(async () => {
    if (running || resending) return;
    setResending(true);
    await requestLink();
    if (mounted.current) setResending(false);
  }, [requestLink, resending, running]);

  /** No passo "enviado", voltar permite corrigir um e-mail digitado errado. */
  const goBack = useCallback(() => {
    if (loading || resending) return;
    if (step === "email") {
      leaveToSignIn();
      return;
    }
    setError(null);
    resetCountdown();
    setStep("email");
  }, [leaveToSignIn, loading, resending, resetCountdown, step]);

  return {
    step,
    title: COPY[step].title,
    subtitle: COPY[step].subtitle,
    buttonLabel: loading ? "Enviando…" : COPY[step].button,
    loading,
    error,
    /** E-mail inválido só esmaece o botão: o toque revela o erro. */
    dimmed: step === "email" && !emailValid,

    email,
    setEmail: changeEmail,

    resendLabel: resending
      ? "Reenviando…"
      : running
        ? `Reenviar em ${formatCountdown(remaining)}`
        : "Reenviar link",
    canResend: !running && !resending,
    resendLink,

    submit,
    goBack,
    leaveToSignIn,
  };
};
