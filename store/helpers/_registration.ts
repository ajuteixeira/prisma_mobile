import type { RegisterPayload } from "@/services";
import { create } from "zustand";

type PendingRegistration = {
  payload: RegisterPayload;
  /** Token de `POST /api/auth/register/code`, devolvido junto do código. */
  verificationToken: string;
  /** Segundos até o reenvio do código ser liberado. */
  resendIn: number;
};

type RegistrationStore = {
  pending: PendingRegistration | null;
  setPending: (pending: PendingRegistration) => void;
  clear: () => void;
};

/**
 * Cadastro aguardando a confirmação do e-mail. Fica em memória, e não nos
 * parâmetros da rota, porque carrega a senha até a conta ser criada.
 */
const useRegistration = create<RegistrationStore>()((set) => ({
  pending: null,
  setPending: (pending) => set({ pending }),
  clear: () => set({ pending: null }),
}));

export { useRegistration };
export type { PendingRegistration, RegistrationStore };
