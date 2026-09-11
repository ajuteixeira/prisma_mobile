import { z } from "zod";

const envSchema = z.object({
  API_URL: z.string(),
});

const env = envSchema.parse({
  API_URL: process.env.EXPO_PUBLIC_API_URL,
});

export const settings = {
  ...env,
};