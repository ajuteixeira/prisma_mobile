import {
  AuthHeader,
  AuthPrompt,
  AuthScreen,
  AuthSpacer,
  IdentityStep,
  RegisterEmailStep,
  RegisterPasswordStep,
} from "@/components/auth";
import { FormError, GradientButton, StepTransition } from "@/components/ui";
import { useRequest } from "@/hooks";
import { registerStepSchemas, validate } from "@/schemas";
import { authApi, type RegisterPayload } from "@/services";
import { useRegistration } from "@/store";
import { describeApiError, firstFieldError, goBackOr } from "@/utils";
import { useRouter } from "expo-router";
import { useState } from "react";

type Step = keyof typeof registerStepSchemas;

const STEPS: Step[] = ["identity", "email", "password"];

const COPY: Record<Step, { title: string; subtitle: string; button: string }> = {
  identity: {
    title: "Crie seu perfil",
    subtitle: "Como você quer ser conhecido no Prisma?",
    button: "Continuar",
  },
  email: {
    title: "Seu e-mail",
    subtitle: "Usamos para proteger a conta e recuperar o acesso.",
    button: "Continuar",
  },
  password: {
    title: "Defina uma senha",
    subtitle: "Mínimo de 6 caracteres. Quanto mais forte, melhor.",
    button: "Criar conta",
  },
};

/** Campo conferido na API antes de sair do passo, com a mensagem de "em uso". */
const UNIQUE_FIELD = {
  identity: { field: "username", taken: "Este nickname já está em uso, escolha outro." },
  email: { field: "email", taken: "Este e-mail já está em uso, escolha outro." },
} as const;

/** Passo onde cada campo do `422` de `POST /api/auth/register/code` é editado. */
const FIELD_STEP: Record<string, Step> = {
  full_name: "identity",
  username: "identity",
  email: "email",
  password: "password",
};

const EMPTY_FORM = { fullName: "", username: "", email: "", password: "", passwordConfirmation: "" };

/**
 * Cadastro em três passos no mesmo sheet. O último pede o código de confirmação
 * e segue para `/verify-email`, onde a conta é de fato criada.
 */
export default function RegisterScreen() {
  const router = useRouter();
  const setPending = useRegistration((state) => state.setPending);
  const request = useRequest();
  const [step, setStep] = useState<Step>("identity");
  const [form, setForm] = useState(EMPTY_FORM);

  const stepIndex = STEPS.indexOf(step);
  const stepError = validate(registerStepSchemas[step], form).error;

  const edit = (changes: Partial<typeof EMPTY_FORM>) => {
    request.setError(null);
    setForm((current) => ({ ...current, ...changes }));
  };

  const leave = () => goBackOr(router, "/");

  /** Só avança se o nickname/e-mail do passo ainda não estiver em uso. */
  const advance = async (unique: (typeof UNIQUE_FIELD)[keyof typeof UNIQUE_FIELD]) => {
    const value = form[unique.field].trim();
    const result = await request.run(() => authApi.availability({ [unique.field]: value }));
    if (!result) return;
    if (result[unique.field] === false) request.setError(unique.taken);
    else setStep(STEPS[stepIndex + 1]);
  };

  const requestCode = async () => {
    const payload: RegisterPayload = {
      email: form.email.trim(),
      password: form.password,
      username: form.username,
      full_name: form.fullName.trim(),
    };
    const sent = await request.run(
      () => authApi.requestRegisterCode(payload),
      (error) => {
        // Erro de campo leva ao passo onde ele é corrigido.
        const fieldError = firstFieldError(error);
        if (fieldError && FIELD_STEP[fieldError.field]) setStep(FIELD_STEP[fieldError.field]);
        return fieldError?.message ?? describeApiError(error);
      },
    );
    if (!sent) return;
    setPending({ payload, verificationToken: sent.verification_token, resendIn: sent.resend_in });
    // `push` mantém o cadastro na pilha: "Voltar e alterar dados" reencontra os campos.
    router.push("/verify-email");
  };

  const submit = () => {
    if (request.loading) return;
    if (stepError) return request.setError(stepError);
    if (step === "password") return requestCode();
    return advance(UNIQUE_FIELD[step]);
  };

  const goBack = () => {
    if (request.loading) return;
    if (stepIndex === 0) return leave();
    request.setError(null);
    setStep(STEPS[stepIndex - 1]);
  };

  const loadingLabel = step === "password" ? "Enviando código…" : "Verificando…";

  return (
    <AuthScreen
      header={
        <AuthHeader
          title={COPY[step].title}
          subtitle={COPY[step].subtitle}
          onBack={goBack}
          stepLabel={`PASSO ${stepIndex + 1} DE ${STEPS.length}`}
          progress={{ total: STEPS.length, current: stepIndex + 1 }}
        />
      }
    >
      <StepTransition step={step}>
        {step === "identity" ? (
          <IdentityStep
            fullName={form.fullName}
            onChangeFullName={(fullName) => edit({ fullName })}
            username={form.username}
            onChangeUsername={(username) => edit({ username })}
            onSubmit={submit}
          />
        ) : null}

        {step === "email" ? (
          <RegisterEmailStep
            email={form.email}
            onChangeEmail={(email) => edit({ email })}
            onSubmit={submit}
          />
        ) : null}

        {step === "password" ? (
          <RegisterPasswordStep
            password={form.password}
            onChangePassword={(password) => edit({ password })}
            passwordConfirmation={form.passwordConfirmation}
            onChangePasswordConfirmation={(passwordConfirmation) => edit({ passwordConfirmation })}
            onSubmit={submit}
          />
        ) : null}
      </StepTransition>

      <AuthSpacer />
      <FormError message={request.error} />
      <GradientButton
        label={request.loading ? loadingLabel : COPY[step].button}
        loading={request.loading}
        dimmed={stepError !== null}
        onPress={submit}
      />
      <AuthPrompt question="Já tem uma conta?" action="Entrar" onPress={leave} />
    </AuthScreen>
  );
}
