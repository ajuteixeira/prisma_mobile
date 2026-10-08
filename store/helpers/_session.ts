import { settings } from "@/config";
import { bindSession, type ApiUser } from "@/services";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { create } from "zustand";

type PersistedSession = {
  token: string;
  user: ApiUser;
};

type SessionStore = {
  /** `false` até a sessão salva no aparelho ser lida, na abertura do app. */
  hydrated: boolean;
  token: string | null;
  user: ApiUser | null;
  /** Lê a sessão salva no aparelho. Chamar uma vez, no layout raiz. */
  hydrate: () => Promise<void>;
  /** Guarda token e usuário na memória e no aparelho. */
  signIn: (session: PersistedSession) => void;
  /** Apaga a sessão da memória e do aparelho. */
  signOut: () => void;
};

/** O SecureStore não existe no web; lá a sessão fica no `localStorage`. */
const storage = {
  get: async (key: string) =>
    Platform.OS === "web"
      ? (globalThis.localStorage?.getItem(key) ?? null)
      : SecureStore.getItemAsync(key),
  set: async (key: string, value: string) =>
    Platform.OS === "web"
      ? globalThis.localStorage?.setItem(key, value)
      : SecureStore.setItemAsync(key, value),
  remove: async (key: string) =>
    Platform.OS === "web"
      ? globalThis.localStorage?.removeItem(key)
      : SecureStore.deleteItemAsync(key),
};

const SESSION_KEY = settings.STORAGE_KEYS.session;

/** Sessão autenticada: token Bearer e usuário devolvidos pela API, salvos no aparelho. */
const useSession = create<SessionStore>()((set) => ({
  hydrated: false,
  token: null,
  user: null,

  hydrate: async () => {
    try {
      const raw = await storage.get(SESSION_KEY);
      if (raw) {
        const { token, user } = JSON.parse(raw) as PersistedSession;
        set({ token, user });
      }
    } catch {
      // Sessão salva ilegível ou armazenamento indisponível: o app abre deslogado.
    } finally {
      set({ hydrated: true });
    }
  },

  signIn: ({ token, user }) => {
    set({ token, user });
    storage.set(SESSION_KEY, JSON.stringify({ token, user })).catch(() => undefined);
  },

  signOut: () => {
    set({ token: null, user: null });
    storage.remove(SESSION_KEY).catch(() => undefined);
  },
}));

// Token recusado pelo servidor (expirado ou revogado): sem limpar, o app ficaria
// preso numa sessão salva que nenhuma rota autenticada aceita.
bindSession({ onUnauthorized: () => useSession.getState().signOut() });

export { useSession };
export type { PersistedSession, SessionStore };
