import { ApiError, authService } from "@/services";
import { useRegistration, useSession } from "@/store";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatCountdown, useCountdown } from "./_use-countdown";

export type VerifyEmailStep = "code" | "done";

export const VERIFICATION_CODE_LENGTH = 6;

const FIELD_LABEL: Record<string, string> = {
  full_name: "Nome",
  username: "Nickname",
  email: "E-mail",
  password: "Senha",
};

/**
 * Mensagem para o erro da API. `codeRejected` indica erro do próprio código
 * (incorreto, expirado, tentativas esgotadas), que limpa as caixas; erro de
 * campo só acontece se o nickname/e-mail foi tomado enquanto o código chegava.
 */
const describeVerifyError = (error: unknown): { message: string; codeRejected: boolean } => {
  if (!(error instanceof ApiError))
    return { message: "Não foi possível conectar ao servidor. Tente novamente.", codeRejected: false };

  const [field, messages] = Object.entries(error.fieldErrors)[0] ?? [];
  if (!field) return { message: error.message, codeRejected: true };

  return {
    message: `${FIELD_LABEL[field] ?? field} ${messages?.[0] ?? "inválido"}. Volte e altere os dados.`,
    codeRejected: false,
  };
};

/**
 * Confirmação do e-mail do cadastro (artboard 7a): o usuário digita o código
 * enviado por `POST /api/auth/register/code` e só então a conta é criada em
 * `POST /api/auth/register`. Os dados do cadastro chegam pelo `useRegistration`.
 */
export const useVerifyEmail = () => {
  const router = useRouter();
  const signIn = useSession((state) => state.signIn);
  const pending = useRegistration((state) => state.pending);
  const setPending = useRegistration((state) => state.setPending);
  const clearPending = useRegistration((state) => state.clear);
  const { remaining, running, start: startCountdown } = useCountdown(pending?.resendIn ?? 0);

  const [step, setStep] = useState<VerifyEmailStep>("code");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  /** O erro veio do código: as caixas ficam vermelhas até a próxima edição. */
  const [codeInvalid, setCodeInvalid] = useState(false);
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

  // O código acabou de ser enviado pelo cadastro: o reenvio começa bloqueado.
  // Só na montagem; cada reenvio reinicia a contagem com o prazo da resposta.
  useEffect(() => {
    startCountdown();
  }, []);

  const changeCode = useCallback((value: string) => {
    setError(null);
    setCodeInvalid(false);
    setCode(value);
  }, []);

  const goToPlatforms = useCallback(() => {
    clearPending();
    router.replace("/connect-platforms");
  }, [clearPending, router]);

  const submit = useCallback(async () => {
    if (loading || !pending) return;

    if (step === "done") {
      goToPlatforms();
      return;
    }

    if (code.length < VERIFICATION_CODE_LENGTH) {
      setError(`Preencha os ${VERIFICATION_CODE_LENGTH} dígitos do código.`);
      return;
    }

    setLoading(true);
    try {
      const session = await authService.register({
        ...pending.payload,
        code,
        verification_token: pending.verificationToken,
      });
      signIn(session);
      if (mounted.current) setStep("done");
    } catch (requestError) {
      if (!mounted.current) return;
      const { message, codeRejected } = describeVerifyError(requestError);
      setError(message);
      if (codeRejected) {
        setCode("");
        setCodeInvalid(true);
      }
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [code, goToPlatforms, loading, pending, signIn, step]);

  /** Pede um código novo: o token anterior deixa de valer. */
  const resendCode = useCallback(async () => {
    if (!pending || running || resending || loading) return;

    setResending(true);
    setError(null);
    setCodeInvalid(false);
    try {
      const { verification_token, resend_in } = await authService.requestRegisterCode(
        pending.payload,
      );
      setPending({ ...pending, verificationToken: verification_token, resendIn: resend_in });
      if (!mounted.current) return;
      setCode("");
      startCountdown(resend_in);
    } catch (requestError) {
      if (mounted.current) setError(describeVerifyError(requestError).message);
    } finally {
      if (mounted.current) setResending(false);
    }
  }, [loading, pending, resending, running, setPending, startCountdown]);

  /** Volta ao cadastro, que continua na pilha com os campos preenchidos. */
  const goBack = useCallback(() => {
    if (loading || resending) return;
    if (router.canGoBack()) router.back();
    else router.replace("/register");
  }, [loading, resending, router]);

  return {
    /**
     * Sem cadastro pendente (ex.: app reaberto nesta rota) a tela volta ao
     * cadastro. Depois de confirmado o pendente é limpo de propósito.
     */
    missingRegistration: pending === null && step === "code",
    step,
    email: pending?.payload.email ?? "",
    buttonLabel: loading ? "Verificando…" : step === "code" ? "Confirmar código" : "Vincular contas",
    loading,
    error,
    /** Código incompleto só esmaece o botão: o toque revela o erro. */
    dimmed: step === "code" && code.length < VERIFICATION_CODE_LENGTH,

    code,
    setCode: changeCode,
    codeInvalid,

    resendLabel: resending
      ? "Reenviando…"
      : running
        ? `Reenviar em ${formatCountdown(remaining)}`
        : "Reenviar código",
    canResend: !running && !resending && !loading,
    resendCode,

    submit,
    /** Depois de criada a conta não há volta: o cadastro já foi concluído. */
    goBack: step === "code" ? goBack : undefined,
  };
};
