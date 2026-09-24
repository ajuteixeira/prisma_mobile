import { ApiError, authService } from "@/services";
import { useSession } from "@/store";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i;

/**
 * `401` é credencial errada: a mensagem não diz qual dos dois campos falhou,
 * para não revelar se o e-mail tem conta.
 */
const describeLoginError = (error: unknown) => {
  if (!(error instanceof ApiError))
    return "Não foi possível conectar ao servidor. Tente novamente.";
  if (error.status === 401) return "E-mail ou senha incorretos.";
  return error.message;
};

/**
 * Estado do login: valida e-mail e senha, chama `POST /api/auth/login` e guarda
 * a sessão devolvida — o mesmo `{token, user}` do cadastro.
 */
export const useLogin = () => {
  const router = useRouter();
  const signIn = useSession((state) => state.signIn);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /** Evita `setState` depois que a tela saiu da pilha no meio da requisição. */
  const mounted = useRef(true);
  useEffect(
    () => () => {
      mounted.current = false;
    },
    [],
  );

  /** Mensagem de erro dos campos, ou `null` quando dá para enviar. */
  const validate = useCallback((): string | null => {
    if (!EMAIL_PATTERN.test(email.trim())) return "Digite um e-mail válido.";
    return password.length > 0 ? null : "Digite sua senha.";
  }, [email, password]);

  const submit = useCallback(async () => {
    if (loading) return;

    const message = validate();
    if (message) {
      setError(message);
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const session = await authService.login({ email: email.trim(), password });
      signIn(session);
      router.replace("/home");
    } catch (requestError) {
      if (mounted.current) setError(describeLoginError(requestError));
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [email, loading, password, router, signIn, validate]);

  /** Qualquer edição limpa o erro exibido acima do botão. */
  const changeEmail = useCallback((value: string) => {
    setError(null);
    setEmail(value);
  }, []);

  const changePassword = useCallback((value: string) => {
    setError(null);
    setPassword(value);
  }, []);

  const togglePasswordVisibility = useCallback(
    () => setPasswordVisible((visible) => !visible),
    [],
  );

  const goToForgotPassword = useCallback(() => {
    if (!loading) router.push("/forgot-password");
  }, [loading, router]);

  const goToRegister = useCallback(() => {
    if (!loading) router.push("/register");
  }, [loading, router]);

  const dimmed = useMemo(() => validate() !== null, [validate]);

  return {
    buttonLabel: loading ? "Entrando…" : "Entrar",
    loading,
    error,
    /** Campos incompletos só esmaecem o botão: o toque revela o erro. */
    dimmed,

    email,
    setEmail: changeEmail,
    password,
    setPassword: changePassword,
    passwordVisible,
    togglePasswordVisibility,

    submit,
    goToForgotPassword,
    goToRegister,
  };
};
