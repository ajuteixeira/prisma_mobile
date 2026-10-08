/** Como o backend aceita: minúsculas, e o que não for a-z, 0-9 ou _ vira _. */
export const sanitizeUsername = (value: string) => value.toLowerCase().replace(/[^a-z0-9_]/g, "_");

/** Força da senha de 0 a 4, um ponto por critério atendido. */
export const passwordScore = (password: string) =>
  [
    password.length >= 6,
    password.length >= 10,
    /[A-Z]/.test(password),
    /[0-9!@#$%^&*]/.test(password),
  ].filter(Boolean).length;
