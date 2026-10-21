import { request } from "./_client";
import type {
  AuthResponse,
  Availability,
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  LoginPayload,
  RegisterCodeResponse,
  RegisterPayload,
  VerifiedRegisterPayload,
} from "./types";

export const authApi = {
  /**
   * Valida os dados do cadastro e envia o código de confirmação para o e-mail.
   * Erros de campo voltam aqui (`422`), antes de o código ser enviado.
   */
  requestRegisterCode: (payload: RegisterPayload) =>
    request<RegisterCodeResponse>("/api/auth/register/code", { body: payload }),

  /**
   * Cria a conta se o código conferir: `422` código incorreto, `410` expirado e
   * `429` tentativas esgotadas. Nesses casos é preciso pedir um novo código.
   */
  register: (payload: VerifiedRegisterPayload) =>
    request<AuthResponse>("/api/auth/register", { body: payload }),

  /** Credenciais erradas voltam `401`; a sessão tem o mesmo formato do cadastro. */
  login: (payload: LoginPayload) => request<AuthResponse>("/api/auth/login", { body: payload }),

  /** Confere se username e/ou e-mail ainda estão livres; só volta as chaves enviadas. */
  availability: (fields: { username?: string; email?: string }) =>
    request<Availability>("/api/auth/availability", { body: fields }),

  /** Envia o link de redefinição; a nova senha é criada na versão web. */
  forgotPassword: (payload: ForgotPasswordPayload) =>
    request<ForgotPasswordResponse>("/api/auth/password/forgot", { body: payload }),

  /** Encerra no servidor a sessão do token; o Bearer é obrigatório. */
  logout: (token: string) => request<null>("/api/auth/logout", { token, method: "POST" }),

  /** Apaga a conta do token com perfil, plataformas, jogos e conquistas; `204` no sucesso. */
  deleteAccount: (token: string) =>
    request<null>("/api/auth/account", { token, method: "DELETE" }),
};
