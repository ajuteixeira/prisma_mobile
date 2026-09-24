import { COLORS, PASSWORD_STRENGTH_COLORS, PASSWORD_STRENGTH_LABELS } from "@/constants";
import { ApiError, authService, type RegisterPayload } from "@/services";
import { useSession } from "@/store";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type RegisterStep = "identity" | "email" | "password";

/** Ordem dos passos; o índice alimenta o rótulo e a barra de progresso. */
const STEPS: RegisterStep[] = ["identity", "email", "password"];

const MIN_PASSWORD_LENGTH = 6;
const MIN_FULL_NAME_LENGTH = 3;

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i;
const USERNAME_PATTERN = /^[a-z0-9_]{3,}$/;
/** Enquanto digita, tudo que o backend não aceita no username vira underscore. */
const USERNAME_FORBIDDEN = /[^a-z0-9_]/g;

const COPY: Record<RegisterStep, { title: string; subtitle: string; button: string }> = {
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

/** Passo onde cada campo do `422` de `POST /api/auth/register` é editado. */
const FIELD_STEP: Record<string, RegisterStep> = {
  full_name: "identity",
  username: "identity",
  email: "email",
  password: "password",
};

/** Campo cuja disponibilidade é conferida na API antes de sair de cada passo. */
const UNIQUE_FIELD: Partial<Record<RegisterStep, "username" | "email">> = {
  identity: "username",
  email: "email",
};

const TAKEN_MESSAGE = {
  username: "Este nickname já está em uso, escolha outro.",
  email: "Este e-mail já está em uso, escolha outro.",
};

const FIELD_LABEL: Record<string, string> = {
  full_name: "Nome",
  username: "Nickname",
  email: "E-mail",
  password: "Senha",
};

/** Primeiro erro de campo da API, já com o passo que precisa ser corrigido. */
const describeRegisterError = (error: unknown): { message: string; step?: RegisterStep } => {
  if (!(error instanceof ApiError))
    return { message: "Não foi possível conectar ao servidor. Tente novamente." };

  const [field, messages] = Object.entries(error.fieldErrors)[0] ?? [];
  if (!field) return { message: error.message };

  return {
    message: `${FIELD_LABEL[field] ?? field} ${messages?.[0] ?? "inválido"}.`,
    step: FIELD_STEP[field],
  };
};

/**
 * Pontuação de 0 a 4 da senha — um ponto por critério atendido. Alimenta a
 * régua colorida abaixo do campo.
 */
const scorePassword = (password: string) =>
  [
    password.length >= MIN_PASSWORD_LENGTH,
    password.length >= 10,
    /[A-Z]/.test(password),
    /[0-9!@#$%^&*]/.test(password),
  ].filter(Boolean).length;

/**
 * Máquina de estados do cadastro: perfil → e-mail → senha, tudo no mesmo sheet.
 * O último passo envia tudo para `POST /api/auth/register` e guarda a sessão.
 */
export const useRegister = () => {
  const router = useRouter();
  const signIn = useSession((state) => state.signIn);

  const [step, setStep] = useState<RegisterStep>("identity");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  /** Conferindo na API se o nickname/e-mail do passo atual está livre. */
  const [checking, setChecking] = useState(false);

  /** Evita `setState` depois que a tela saiu da pilha no meio da requisição. */
  const mounted = useRef(true);
  useEffect(
    () => () => {
      mounted.current = false;
    },
    [],
  );

  const runRequest = useCallback(
    async (payload: RegisterPayload) => {
      setLoading(true);
      try {
        const session = await authService.register(payload);
        signIn(session);
        // Conta criada: o passo seguinte do onboarding é vincular as plataformas.
        router.replace("/connect-platforms");
      } catch (requestError) {
        if (!mounted.current) return;
        const { message, step: fieldStep } = describeRegisterError(requestError);
        if (fieldStep) setStep(fieldStep);
        setError(message);
      } finally {
        if (mounted.current) setLoading(false);
      }
    },
    [router, signIn],
  );

  /** Qualquer edição limpa o erro exibido acima do botão. */
  const edit = useCallback(
    <T,>(setter: (value: T) => void) =>
      (value: T) => {
        setError(null);
        setter(value);
      },
    [],
  );

  const changeUsername = useCallback((value: string) => {
    setError(null);
    setUsername(value.toLowerCase().replace(USERNAME_FORBIDDEN, "_"));
  }, []);

  const usernameValid = useMemo(() => USERNAME_PATTERN.test(username), [username]);

  const strength = useMemo(() => {
    const score = scorePassword(password);
    return {
      score,
      label: password ? PASSWORD_STRENGTH_LABELS[score] : "",
      color: PASSWORD_STRENGTH_COLORS[score],
      /** Todos os segmentos acesos assumem a cor da pontuação atual. */
      segments: PASSWORD_STRENGTH_COLORS.slice(1).map((_, index) =>
        score >= index + 1 ? PASSWORD_STRENGTH_COLORS[score] : COLORS.track,
      ),
    };
  }, [password]);

  const passwordsMatch = useMemo(
    () => (passwordConfirmation.length === 0 ? null : password === passwordConfirmation),
    [password, passwordConfirmation],
  );

  /** Mensagem de erro do passo atual, ou `null` quando ele está válido. */
  const validate = useCallback((): string | null => {
    switch (step) {
      case "identity":
        if (fullName.trim().length < MIN_FULL_NAME_LENGTH)
          return "Informe seu nome completo (mín. 3 caracteres).";
        return usernameValid ? null : "Nickname precisa de 3+ caracteres: a-z, 0-9 e _.";
      case "email":
        return EMAIL_PATTERN.test(email.trim()) ? null : "Digite um e-mail válido.";
      case "password":
        if (password.length < MIN_PASSWORD_LENGTH)
          return "A senha precisa de no mínimo 6 caracteres.";
        return password === passwordConfirmation ? null : "As senhas não coincidem.";
    }
  }, [email, fullName, password, passwordConfirmation, step, usernameValid]);

  const stepIndex = STEPS.indexOf(step);
  const isLastStep = stepIndex === STEPS.length - 1;

  const leaveToSignIn = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  }, [router]);

  /** Só avança se o nickname/e-mail do passo ainda não estiver em uso. */
  const advance = useCallback(async () => {
    const field = UNIQUE_FIELD[step];
    const next = STEPS[stepIndex + 1];
    if (!field) {
      setStep(next);
      return;
    }

    setChecking(true);
    try {
      const value = field === "username" ? username.trim() : email.trim();
      const result = await authService.availability({ [field]: value });
      if (!mounted.current) return;
      if (result[field] === false) setError(TAKEN_MESSAGE[field]);
      else setStep(next);
    } catch (requestError) {
      if (mounted.current) setError(describeRegisterError(requestError).message);
    } finally {
      if (mounted.current) setChecking(false);
    }
  }, [email, step, stepIndex, username]);

  const submit = useCallback(() => {
    if (loading || checking) return;

    const message = validate();
    if (message) {
      setError(message);
      return;
    }

    if (!isLastStep) {
      advance();
      return;
    }

    const payload: RegisterPayload = {
      email: email.trim(),
      password,
      username: username.trim(),
      full_name: fullName.trim(),
    };

    runRequest(payload);
  }, [
    advance,
    checking,
    email,
    fullName,
    isLastStep,
    loading,
    password,
    runRequest,
    stepIndex,
    username,
    validate,
  ]);

  const goBack = useCallback(() => {
    if (loading || checking) return;
    if (stepIndex === 0) {
      leaveToSignIn();
      return;
    }
    setError(null);
    setStep(STEPS[stepIndex - 1]);
  }, [checking, leaveToSignIn, loading, stepIndex]);

  return {
    step,
    title: COPY[step].title,
    subtitle: COPY[step].subtitle,
    buttonLabel: loading ? "Criando conta…" : checking ? "Verificando…" : COPY[step].button,
    stepLabel: `PASSO ${stepIndex + 1} DE ${STEPS.length}`,
    progress: { total: STEPS.length, current: stepIndex + 1 },
    loading: loading || checking,
    error,
    /** Passo incompleto só esmaece o botão: o toque revela o erro. */
    dimmed: validate() !== null,

    fullName,
    setFullName: edit(setFullName),
    username,
    setUsername: changeUsername,

    email,
    setEmail: edit(setEmail),

    password,
    setPassword: edit(setPassword),
    passwordConfirmation,
    setPasswordConfirmation: edit(setPasswordConfirmation),
    passwordVisible,
    togglePasswordVisibility: () => setPasswordVisible((visible) => !visible),
    passwordsMatch,
    strength,

    submit,
    goBack,
    leaveToSignIn,
  };
};
