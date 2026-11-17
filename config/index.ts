import { z } from "zod";

const envSchema = z.object({
  API_URL: z.string(),
  /**
   * Deep link para onde o backend redireciona ao fim do OpenID/OAuth
   * (`MOBILE_DEEP_LINK` no servidor). O esquema precisa estar em `app.json`.
   */
  CONNECT_REDIRECT_URL: z.string().default("prisma://connect"),
  /** Só em dev: atraso, em ms, antes de cada `GET` da API, para ver os estados de carregamento. */
  SIMULATED_DELAY_MS: z.coerce.number().int().nonnegative().default(0),
});

const env = envSchema.parse({
  API_URL: process.env.EXPO_PUBLIC_API_URL,
  CONNECT_REDIRECT_URL: process.env.EXPO_PUBLIC_CONNECT_REDIRECT_URL || undefined,
  SIMULATED_DELAY_MS: process.env.EXPO_PUBLIC_SIMULATED_DELAY_MS || undefined,
});

export const settings = {
  ...env,
  STORAGE_KEYS: {
    session: "prisma.session",
  },
} as const;