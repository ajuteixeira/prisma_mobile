import { z } from "zod";

export const MIN_PASSWORD_LENGTH = 6;

export const emailSchema = z.string().trim().pipe(z.email("Digite um e-mail válido."));

export const fullNameSchema = z
  .string()
  .trim()
  .min(3, "Informe seu nome completo (mín. 3 caracteres).");

/** O formato que o backend aceita para o @ público. */
export const usernameSchema = z
  .string()
  .regex(/^[a-z0-9_]{3,50}$/, "Nickname precisa de 3+ caracteres: a-z, 0-9 e _.");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Digite sua senha."),
});

/** Um schema por passo do cadastro. */
export const registerStepSchemas = {
  identity: z.object({ fullName: fullNameSchema, username: usernameSchema }),
  email: z.object({ email: emailSchema }),
  password: z
    .object({
      password: z
        .string()
        .min(MIN_PASSWORD_LENGTH, "A senha precisa de no mínimo 6 caracteres."),
      passwordConfirmation: z.string(),
    })
    .refine((form) => form.password === form.passwordConfirmation, "As senhas não coincidem."),
};
