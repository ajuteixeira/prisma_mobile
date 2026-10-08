import type { PlatformSlug } from "@/constants";

/** Conta vinculada como `ApiJSON.platform_account/1` a serializa. */
export type PlatformAccount = {
  platform: PlatformSlug;
  external_user_id: string;
  profile_url: string | null;
  sync_status: string;
};

/** Resposta de `POST /api/platforms/:slug/verification-code` (PSN e RetroAchievements). */
export type VerificationCode = {
  code: string;
  /** Token assinado que amarra o código ao perfil; volta no `connect`. */
  verification_token: string;
  /** Validade do token, em segundos. */
  expires_in: number;
};

/** Corpo de `POST /api/platforms/:slug/connect`. */
export type OwnershipPayload = {
  /** PSN ID ou usuário do RetroAchievements. */
  username: string;
  /** NPSSO ou Web API Key do RetroAchievements. */
  api_key: string;
  verification_token: string;
};
