import { apiRequest } from "./_api";

export type ApiUser = {
  id: number;
  email: string;
  username: string;
  full_name: string | null;
};

/** Corpo de `POST /api/auth/register`. */
export type RegisterPayload = {
  email: string;
  password: string;
  username: string;
  full_name?: string;
};

/** Resposta `201` de `POST /api/auth/register` (e `200` do login). */
export type AuthResponse = {
  token: string;
  user: ApiUser;
};

export const register = (payload: RegisterPayload) =>
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
