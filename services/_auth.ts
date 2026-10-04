import { apiRequest } from "./_api";

export type ApiUser = {
  id: number;
  email: string;
  username: string;
  full_name: string | null;
};

/** Dados do cadastro, enviados a `POST /api/auth/register/code` e depois a `register`. */
export type RegisterPayload = {
  email: string;
  password: string;
  username: string;
  full_name?: string;
};

/** Resposta `202` de `POST /api/auth/register/code`; prazos em segundos. */
export type RegisterCodeResponse = {
  verification_token: string;
  expires_in: number;
  resend_in: number;
};

/**
 * Valida os dados do cadastro e envia o código de confirmação para o e-mail.
 * Erros de campo voltam aqui (`422`), antes de o código ser enviado.
 */
export const requestRegisterCode = (payload: RegisterPayload) =>
  apiRequest<RegisterCodeResponse>("/api/auth/register/code", { body: payload });

/** Corpo de `POST /api/auth/register`: os dados do cadastro mais o código recebido. */
export type VerifiedRegisterPayload = RegisterPayload & {
  code: string;
  verification_token: string;
};

/** Resposta `201` de `POST /api/auth/register` (e `200` do login). */
export type AuthResponse = {
  token: string;
  user: ApiUser;
};

/**
 * Cria a conta se o código conferir: `422` código incorreto, `410` expirado e
 * `429` tentativas esgotadas — nesses casos é preciso pedir um novo código.
 */
export const register = (payload: VerifiedRegisterPayload) =>
  apiRequest<AuthResponse>("/api/auth/register", { body: payload });

/** Corpo de `POST /api/auth/login` — o login é por e-mail e senha (RF03). */
export type LoginPayload = {
  email: string;
  password: string;
};

/** Credenciais erradas voltam `401`; a sessão tem o mesmo formato do cadastro. */
export const login = (payload: LoginPayload) =>
  apiRequest<AuthResponse>("/api/auth/login", { body: payload });

/** Campos conferidos por `POST /api/auth/availability`; `true` = disponível. */
export type Availability = { username?: boolean; email?: boolean };

/** Confere se username e/ou e-mail ainda estão livres; só volta as chaves enviadas. */
export const availability = (fields: { username?: string; email?: string }) =>
  apiRequest<Availability>("/api/auth/availability", { body: fields });
/** Corpo de `POST /api/auth/password/forgot`. */
export type ForgotPasswordPayload = {
  email: string;
};

/** Resposta `202`, idêntica exista ou não a conta (evita enumeração de e-mails). */
export type ForgotPasswordResponse = {
  message: string;
};

/** Envia o link de redefinição; a nova senha é criada na versão web. */
export const forgotPassword = (payload: ForgotPasswordPayload) =>
  apiRequest<ForgotPasswordResponse>("/api/auth/password/forgot", { body: payload });

/**
 * `POST /api/auth/logout` — o Bearer é obrigatório: o servidor encerra a
 * sessão identificada pelo token.
 */
export const logout = (token: string) =>
  apiRequest<null>("/api/auth/logout", { token, method: "POST" });
