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

/** Campos conferidos por `POST /api/auth/availability`; `true` = disponível. */
export type Availability = { username?: boolean; email?: boolean };

/** Confere se username e/ou e-mail ainda estão livres; só volta as chaves enviadas. */
export const availability = (fields: { username?: string; email?: string }) =>
  apiRequest<Availability>("/api/auth/availability", { body: fields });
