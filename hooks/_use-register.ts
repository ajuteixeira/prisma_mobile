import { COLORS, PASSWORD_STRENGTH_COLORS, PASSWORD_STRENGTH_LABELS } from "@/constants";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type RegisterStep = "identity" | "email" | "password";

/** Ordem dos passos; o índice alimenta o rótulo e a barra de progresso. */
const STEPS: RegisterStep[] = ["identity", "email", "password"];

const MIN_PASSWORD_LENGTH = 6;
const MIN_FULL_NAME_LENGTH = 3;
/** Latência simulada enquanto a integração com a API não existe. */
const REQUEST_DELAY = 1400;

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

/** Corpo de `POST /api/auth/register`. */
type RegisterPayload = {
  email: string;
  password: string;
  username: string;
  full_name: string;
};

/** Resposta `201` do mesmo endpoint. */
type RegisterResponse = {
  token: string;
  user: { email: string; username: string };
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
 * A chamada de rede está simulada; `runRequest` é o único ponto a trocar quando
 * a integração com `POST /api/auth/register` existir.
 */
export const useRegister = () => {
  const router = useRouter();

  const [step, setStep] = useState<RegisterStep>("identity");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
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

  const runRequest = useCallback(
    (payload: RegisterPayload, onDone: (response: RegisterResponse) => void) => {
      setLoading(true);
      requestTimeout.current = setTimeout(() => {
        setLoading(false);
        // TODO(api): enviar `payload` para POST /api/auth/register e guardar o
        // token devolvido. Até lá devolvemos a mesma forma da resposta 201.
        onDone({
          token: "token-simulado",
          user: { email: payload.email, username: payload.username },
        });
      }, REQUEST_DELAY);
    },
    [],
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

  const submit = useCallback(() => {
    if (loading) return;

    const message = validate();
    if (message) {
      setError(message);
      return;
    }

    if (!isLastStep) {
      setStep(STEPS[stepIndex + 1]);
      return;
    }

    const payload: RegisterPayload = {
      email: email.trim(),
      password,
      username: username.trim(),
      full_name: fullName.trim(),
    };

    // Conta criada: o passo seguinte do onboarding é vincular as plataformas.
    runRequest(payload, () => router.replace("/connect-platforms"));
  }, [
    email,
    fullName,
    isLastStep,
    loading,
    password,
    router,
    runRequest,
    stepIndex,
    username,
    validate,
  ]);

  const goBack = useCallback(() => {
    if (loading) return;
    if (stepIndex === 0) {
      leaveToSignIn();
      return;
    }
    setError(null);
    setStep(STEPS[stepIndex - 1]);
  }, [leaveToSignIn, loading, stepIndex]);

  return {
    step,
    title: COPY[step].title,
    subtitle: COPY[step].subtitle,
    buttonLabel: loading ? "Criando conta…" : COPY[step].button,
    stepLabel: `PASSO ${stepIndex + 1} DE ${STEPS.length}`,
    progress: { total: STEPS.length, current: stepIndex + 1 },
    loading,
    error,
    /** Passo incompleto só esmaece o botão: o toque revela o erro. */
    dimmed: validate() !== null,

    fullName,
    setFullName: edit(setFullName),
    username,
    setUsername: changeUsername,
    usernameStatus: username.length === 0 ? "" : usernameValid ? "disponível" : "inválido",
    usernameStatusColor: usernameValid ? COLORS.success : COLORS.danger,

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
