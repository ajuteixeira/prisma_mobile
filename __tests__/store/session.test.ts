import { request } from "@/services";
import { useSession } from "@/store";
import { mockFetch } from "@/__tests__/utils";
import * as SecureStore from "expo-secure-store";

const KEY = "prisma.session";
const USER = { id: 1, email: "carly@prisma.gg", username: "carly", full_name: "Carly Mendes" };

/** Espera as gravações que `signIn`/`signOut` disparam em segundo plano. */
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("useSession", () => {
  beforeEach(async () => {
    await SecureStore.deleteItemAsync(KEY);
    useSession.setState({ token: null, user: null, hydrated: false });
  });

  it("salva a sessão no aparelho ao entrar", async () => {
    useSession.getState().signIn({ token: "abc", user: USER });
    await flush();

    expect(JSON.parse((await SecureStore.getItemAsync(KEY))!)).toEqual({ token: "abc", user: USER });
  });

  it("restaura a sessão salva ao abrir o app", async () => {
    await SecureStore.setItemAsync(KEY, JSON.stringify({ token: "abc", user: USER }));

    await useSession.getState().hydrate();

    expect(useSession.getState()).toMatchObject({ hydrated: true, token: "abc", user: USER });
  });

  it("abre deslogado quando a sessão salva está ilegível", async () => {
    await SecureStore.setItemAsync(KEY, "{quebrado");

    await useSession.getState().hydrate();

    expect(useSession.getState()).toMatchObject({ hydrated: true, token: null, user: null });
  });

  it("apaga a sessão do aparelho ao sair", async () => {
    useSession.getState().signIn({ token: "abc", user: USER });
    await flush();

    useSession.getState().signOut();
    await flush();

    expect(await SecureStore.getItemAsync(KEY)).toBeNull();
    expect(useSession.getState().token).toBeNull();
  });

  it("limpa a sessão quando uma rota autenticada responde 401", async () => {
    useSession.getState().signIn({ token: "abc", user: USER });
    mockFetch(401, { error: "Não autorizado" });

    await expect(request("/api/profile", { token: "abc" })).rejects.toMatchObject({ status: 401 });

    expect(useSession.getState().token).toBeNull();
  });

  it("mantém a sessão num 401 sem token, como a senha errada no login", async () => {
    useSession.getState().signIn({ token: "abc", user: USER });
    mockFetch(401, { error: "Email ou senha invalidos" });

    await expect(request("/api/auth/login", { body: {} })).rejects.toMatchObject({ status: 401 });

    expect(useSession.getState().token).toBe("abc");
  });
});
