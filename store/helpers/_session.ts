import type { ApiUser } from "@/services";
import { create } from "zustand";

type SessionStore = {
  token: string | null;
  user: ApiUser | null;
  signIn: (session: { token: string; user: ApiUser }) => void;
  signOut: () => void;
};

/** Sessão autenticada em memória: token Bearer e usuário devolvidos pela API. */
const useSession = create<SessionStore>()((set) => ({
  token: null,
  user: null,
  signIn: ({ token, user }) => set({ token, user }),
  signOut: () => set({ token: null, user: null }),
}));

export { useSession };
export type { SessionStore };
