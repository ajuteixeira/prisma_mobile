import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatCountdown, useCountdown } from "./_use-countdown";

export type ForgotPasswordStep = "email" | "code" | "password" | "success";

export const CODE_LENGTH = 6;
const MIN_PASSWORD_LENGTH = 8;
const RESEND_SECONDS = 60;
/** Latência simulada enquanto a integração com a API não existe. */
const REQUEST_DELAY = 1200;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const COPY: Record<ForgotPasswordStep, { title: string; button: string }> = {
  email: { title: "Esqueci a senha", button: "Enviar código" },
  code: { title: "Verificar código", button: "Confirmar código" },
  password: { title: "Nova senha", button: "Redefinir senha" },
  success: { title: "Tudo pronto", button: "Voltar para o login" },
};

const NEXT_STEP: Record<ForgotPasswordStep, ForgotPasswordStep | null> = {
  email: "code",
  code: "password",
  password: "success",
  success: null,
};

const PREVIOUS_STEP: Record<ForgotPasswordStep, ForgotPasswordStep | null> = {
  email: null,
  code: "email",
  password: "code",
  success: null,
};

/**
 * Máquina de estados da recuperação de senha: e-mail → código → nova senha →
 * confirmação, tudo no mesmo sheet. A chamada de rede está simulada; basta
 * trocar `runRequest` pela integração real quando ela existir.
 */
export const useForgotPassword = () => {
  const router = useRouter();
  const resend = useCountdown(RESEND_SECONDS);

  const [step, setStep] = useState<ForgotPasswordStep>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const requestTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (requestTimeout.current) clearTimeout(requestTimeout.current);
    },
    [],
  );

  const runRequest = useCallback((onDone: () => void) => {
    setLoading(true);
    requestTimeout.current = setTimeout(() => {
      setLoading(false);
      onDone();
    }, REQUEST_DELAY);
  }, []);

  /** Qualquer edição limpa o erro exibido acima do botão. */
  const edit = useCallback(<T,>(setter: (value: T) => void) => (value: T) => {
    setError(null);
    setter(value);
  }, []);

  const passwordsMatch = useMemo(
    () => (passwordConfirmation.length === 0 ? null : password === passwordConfirmation),
    [password, passwordConfirmation],
  );

  /** Retorna a mensagem de erro do passo atual, ou `null` quando está válido. */
  const validate = useCallback((): string | null => {
    switch (step) {
      case "email":
        return EMAIL_PATTERN.test(email.trim()) ? null : "Informe um e-mail válido.";
      case "code":
        return code.length === CODE_LENGTH ? null : `Digite os ${CODE_LENGTH} dígitos do código.`;
      case "password":
        if (password.length < MIN_PASSWORD_LENGTH)
          return `A senha precisa ter ao menos ${MIN_PASSWORD_LENGTH} caracteres.`;
        return password === passwordConfirmation ? null : "As senhas não coincidem.";
      default:
        return null;
    }
  }, [code.length, email, password, passwordConfirmation, step]);

  const leaveToSignIn = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  }, [router]);

  const submit = useCallback(() => {
    if (loading) return;

    if (step === "success") {
      leaveToSignIn();
      return;
    }

    const message = validate();
    if (message) {
      setError(message);
      return;
    }

    runRequest(() => {
      const next = NEXT_STEP[step];
      if (!next) return;
      if (next === "code") resend.start();
      setStep(next);
    });
  }, [leaveToSignIn, loading, resend, runRequest, step, validate]);

  const goBack = useCallback(() => {
    const previous = PREVIOUS_STEP[step];
    if (!previous) {
      leaveToSignIn();
      return;
    }
    setError(null);
    setStep(previous);
  }, [leaveToSignIn, step]);

  const resendCode = useCallback(() => {
    if (resend.running || loading) return;
    setCode("");
    setError(null);
    runRequest(() => resend.start());
  }, [loading, resend, runRequest]);

  const subtitle = useMemo(() => {
    switch (step) {
      case "email":
        return "Informe o e-mail da sua conta e enviaremos um código de verificação.";
      case "code":
        return `Enviamos um código de ${CODE_LENGTH} dígitos para ${email.trim()}.`;
      case "password":
        return "Escolha uma senha nova para voltar a acessar sua conta.";
      case "success":
        return "Sua senha foi atualizada. Entre novamente para continuar.";
    }
  }, [email, step]);

  return {
    step,
    title: COPY[step].title,
    subtitle,
    buttonLabel: COPY[step].button,
    loading,
    error,

    email,
    setEmail: edit(setEmail),
    code,
    setCode: edit(setCode),
    password,
    setPassword: edit(setPassword),
    passwordConfirmation,
    setPasswordConfirmation: edit(setPasswordConfirmation),
    passwordVisible,
    togglePasswordVisibility: () => setPasswordVisible((visible) => !visible),
    passwordsMatch,

    resendLabel: resend.running ? `Reenviar em ${formatCountdown(resend.remaining)}` : "Reenviar código",
    canResend: !resend.running && !loading,
    resendCode,

    submit,
    goBack,
    leaveToSignIn,
  };
};
