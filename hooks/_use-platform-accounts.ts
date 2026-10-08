import { PLATFORMS, type Platform, type PlatformSlug, type PlatformStatus } from "@/constants";
import { platformsApi, type PlatformAccount } from "@/services";
import { useSession, withLoading } from "@/store";
import { authorizeInBrowser, describeApiError } from "@/utils";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import Toast from "react-native-toast-message";

type Account = { status: PlatformStatus; handle: string };

const byPlatform = <T>(value: (slug: PlatformSlug) => T) =>
  Object.fromEntries(PLATFORMS.map(({ slug }) => [slug, value(slug)])) as Record<PlatformSlug, T>;

/** Só o RetroAchievements guarda o username; Steam, PSN e Xbox guardam IDs numéricos. */
const handleOf = (account: PlatformAccount) =>
  account.platform === "retroachievements" ? account.external_user_id : "";

const showError = (text1: string, text2?: string) =>
  Toast.show({ type: "error", text1, text2, position: "top" });

const retryMessage = (error: unknown) => describeApiError(error, "Tente novamente.");

/**
 * Contas vinculadas do usuário e o estado de cada card. Vincula pelo navegador
 * (Steam e Xbox) ou por código de posse (PSN e RetroAchievements), e desvincula.
 */
export const usePlatformAccounts = () => {
  const token = useSession((state) => state.token);
  const [accounts, setAccounts] = useState(() =>
    byPlatform<Account>(() => ({ status: "off", handle: "" })),
  );

  const update = (slug: PlatformSlug, changes: Partial<Account>) =>
    setAccounts((current) => ({ ...current, [slug]: { ...current[slug], ...changes } }));

  // Estável entre renders: o `useFocusEffect` refaz a carga sempre que ela muda.
  const refresh = useCallback(async () => {
    if (!token) return;
    const { platforms } = await platformsApi.list(token);
    const linked = new Map(platforms.map((account) => [account.platform, account]));
    setAccounts((current) =>
      byPlatform((slug) => {
        const account = linked.get(slug);
        if (current[slug].status === "loading") return current[slug];
        // O PSN ID digitado ao vincular vale mais que o accountId numérico.
        return account
          ? { status: "on", handle: current[slug].handle || handleOf(account) }
          : { status: "off", handle: "" };
      }),
    );
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      refresh().catch((error) =>
        showError("Não foi possível carregar suas contas", retryMessage(error)),
      );
    }, [refresh]),
  );

  /** Steam (com a Web API Key) e Xbox: autoriza no navegador e recarrega as contas. */
  const connectInBrowser = async (slug: "steam" | "xbox", apiKey?: string) => {
    if (!token) return;
    update(slug, { status: "loading" });
    try {
      const { url } = await withLoading(() => platformsApi.connectUrl(slug, token, apiKey));
      const result = await authorizeInBrowser(url);
      update(slug, { status: result?.ok ? "on" : "off" });
      // Navegador fechado (`null`) não é erro: só volta a desvinculada.
      if (result?.ok) await refresh().catch(() => undefined);
      else if (result) showError("Não foi possível vincular a conta", result.message);
    } catch (error) {
      update(slug, { status: "off" });
      showError("Não foi possível vincular a conta", retryMessage(error));
    }
  };

  /** PSN e RetroAchievements: só vincula se o código estiver no perfil. Repassa o erro da API. */
  const connectWithCode = async (platform: Platform, values: string[], verificationToken: string) => {
    if (!token) return;
    const { slug, handleField } = platform;
    update(slug, { status: "loading" });
    try {
      await platformsApi.connect(slug, token, {
        username: values[0],
        api_key: values[1],
        verification_token: verificationToken,
      });
      update(slug, { status: "on", handle: handleField === undefined ? "" : values[handleField] });
    } catch (error) {
      update(slug, { status: "off" });
      throw error;
    }
  };

  const disconnect = async (platform: Platform) => {
    if (!token) return;
    update(platform.slug, { status: "loading" });
    try {
      await withLoading(() => platformsApi.disconnect(platform.slug, token));
      update(platform.slug, { status: "off", handle: "" });
    } catch (error) {
      update(platform.slug, { status: "on" });
      showError(`Não foi possível desvincular ${platform.name}`, retryMessage(error));
    }
  };

  return { accounts, connectInBrowser, connectWithCode, disconnect };
};
