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

/** Corpo de `POST /api/auth/login`: o login é por e-mail e senha (RF03). */
export type LoginPayload = {
  email: string;
  password: string;
};

/** Campos conferidos por `POST /api/auth/availability`; `true` = disponível. */
export type Availability = { username?: boolean; email?: boolean };

/** Corpo de `POST /api/auth/password/forgot`. */
export type ForgotPasswordPayload = {
  email: string;
};

/** Resposta `202`, idêntica exista ou não a conta (evita enumeração de e-mails). */
export type ForgotPasswordResponse = {
  message: string;
};
