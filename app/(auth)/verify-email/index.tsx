import { AuthHeader, AuthScreen, AuthSpacer, CodeStep, VerifiedStep } from "@/components/auth";
import { FormError, GradientButton, Icon, StepTransition } from "@/components/ui";
import { useCountdown, useRequest } from "@/hooks";
import { ApiError, authApi } from "@/services";
import { useRegistration, useSession } from "@/store";
import { describeApiError, firstFieldError, goBackOr } from "@/utils";
import { Redirect, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text } from "react-native";

const CODE_LENGTH = 6;

/** Erro de campo só acontece se o nickname/e-mail foi tomado enquanto o código chegava. */
const describeVerifyError = (error: unknown) => {
  const fieldError = firstFieldError(error);
  return fieldError ? `${fieldError.message} Volte e altere os dados.` : describeApiError(error);
};

/**
 * Confirmação do e-mail do cadastro: a conta só é criada quando o código
 * enviado confere. Os dados do cadastro chegam pelo `useRegistration`.
 */
export default function VerifyEmailScreen() {
  const router = useRouter();
  const signIn = useSession((state) => state.signIn);
  const { pending, setPending, clear } = useRegistration();
  // O código acabou de ser enviado pelo cadastro: o reenvio começa bloqueado.
  const countdown = useCountdown(pending?.resendIn ?? 0, true);
  const confirm = useRequest(describeVerifyError);
  const resend = useRequest(describeVerifyError);
  const [verified, setVerified] = useState(false);
  const [code, setCode] = useState("");
  /** O erro veio do código: as caixas ficam vermelhas até a próxima edição. */
  const [codeInvalid, setCodeInvalid] = useState(false);

  // Sem cadastro pendente (ex.: app reaberto nesta rota) volta ao cadastro.
  if (!pending && !verified) return <Redirect href="/register" />;

  const clearErrors = () => {
    confirm.setError(null);
    resend.setError(null);
    setCodeInvalid(false);
  };

  const submit = async () => {
    if (verified) {
      clear();
      return router.replace("/connect-platforms");
    }
    if (!pending) return;
    if (code.length < CODE_LENGTH)
      return confirm.setError(`Preencha os ${CODE_LENGTH} dígitos do código.`);

    const session = await confirm.run(
      () =>
        authApi.register({ ...pending.payload, code, verification_token: pending.verificationToken }),
      (error) => {
        // Código incorreto, expirado ou esgotado: limpa as caixas para digitar de novo.
        if (error instanceof ApiError && !firstFieldError(error)) {
          setCode("");
          setCodeInvalid(true);
        }
        return describeVerifyError(error);
      },
    );
    if (!session) return;
    signIn(session);
    setVerified(true);
  };

  /** Pede um código novo: o token anterior deixa de valer. */
  const resendCode = async () => {
    if (!pending || confirm.loading) return;
    clearErrors();
    const sent = await resend.run(() => authApi.requestRegisterCode(pending.payload));
    if (!sent) return;
    setPending({ ...pending, verificationToken: sent.verification_token, resendIn: sent.resend_in });
    setCode("");
    countdown.start(sent.resend_in);
  };

  /** Depois de criada a conta não há volta: o cadastro já foi concluído. */
  const goBack = verified ? undefined : () => goBackOr(router, "/register");

  return (
    <AuthScreen
      header={
        <AuthHeader
          title="Verifique seu e-mail"
          subtitle="Falta pouco para entrar na comunidade Prisma."
          onBack={goBack}
          stepLabel="CONFIRMAÇÃO"
        />
      }
    >
      <StepTransition step={verified ? "done" : "code"}>
        {verified ? (
          <VerifiedStep />
        ) : (
          <CodeStep
            email={pending?.payload.email ?? ""}
            code={code}
            onChangeCode={(value) => {
              clearErrors();
              setCode(value);
            }}
            codeLength={CODE_LENGTH}
            invalid={codeInvalid}
            resendIn={countdown.remaining}
            resending={resend.loading}
            onResend={resendCode}
          />
        )}
      </StepTransition>

      <AuthSpacer />
      <FormError message={confirm.error ?? resend.error} />
      <GradientButton
        label={confirm.loading ? "Verificando…" : verified ? "Vincular contas" : "Confirmar código"}
        loading={confirm.loading}
        dimmed={!verified && code.length < CODE_LENGTH}
        onPress={submit}
      />
      {goBack ? (
        <Pressable
          accessibilityRole="link"
          onPress={goBack}
          hitSlop={8}
          className="mt-[18px] flex-row items-center justify-center gap-1.5"
        >
          <Icon name="back" size={12} />
          <Text className="text-sm font-semibold text-prisma-accent">Voltar e alterar dados</Text>
        </Pressable>
      ) : null}
    </AuthScreen>
  );
}
