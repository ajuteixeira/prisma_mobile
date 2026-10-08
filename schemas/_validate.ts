import type { z } from "zod";

/** Valida `value` e devolve os dados já transformados ou a primeira mensagem de erro. */
export const validate = <T extends z.ZodType>(schema: T, value: unknown) => {
  const result = schema.safeParse(value);
  return result.success
    ? { data: result.data as z.output<T>, error: null }
    : { data: null, error: result.error.issues[0]?.message ?? "Dados inválidos." };
};
