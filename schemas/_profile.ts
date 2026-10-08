import { z } from "zod";
import { fullNameSchema } from "./_auth";

/** Mesmos limites da web (`ProfileCardLive`) e do `PATCH /api/profile`. */
export const BIO_MAX = 90;

export const profileSchema = z.object({
  fullName: fullNameSchema,
  username: z.string().regex(/^[a-zA-Z0-9_]{3,50}$/),
  bio: z.string().trim().max(BIO_MAX),
});
