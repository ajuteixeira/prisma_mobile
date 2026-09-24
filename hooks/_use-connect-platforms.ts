import { settings } from "@/config";
import type { Platform, PlatformSlug } from "@/constants";
import { BEAM_OFF_OPACITY, COLORS, CONNECT_BEAMS, PLATFORMS } from "@/constants";
import {
  ApiError,
  platformService,
  type PlatformAccount,
  type VerificationCode,
} from "@/services";
import { useSession } from "@/store";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";
import Toast from "react-native-toast-message";

/** Estado de cada card: desvinculado, autenticando ou vinculado. */
export type PlatformStatus = "off" | "loading" | "on";

/** Código emitido pelo backend, com o instante em que deixa de valer. */
type IssuedCode = VerificationCode & { expiresAt: number };

/** Margem para não enviar um código que expira no meio da requisição. */
const CODE_EXPIRY_MARGIN = 60_000;

const byStatus = () =>
  Object.fromEntries(PLATFORMS.map((platform) => [platform.slug, "off"])) as Record<
    PlatformSlug,
    PlatformStatus
  >;

/** Um valor por campo declarado no catálogo. */
const emptyForm = (slug: PlatformSlug) =>
  (PLATFORMS.find((platform) => platform.slug === slug)?.fields ?? []).map(() => "");

const byForm = () =>
  Object.fromEntries(PLATFORMS.map((platform) => [platform.slug, emptyForm(platform.slug)])) as Record<
    PlatformSlug,
    string[]
  >;

const byHandle = () =>
  Object.fromEntries(PLATFORMS.map((platform) => [platform.slug, ""])) as Record<
    PlatformSlug,
    string
  >;

/**
 * Identificador exibido no card para contas vindas de `GET /api/platforms`. Só o
 * RetroAchievements guarda o username; Steam, PSN e Xbox guardam IDs numéricos.
 */
const handleOf = (account: PlatformAccount) =>
  account.platform === "retroachievements" ? account.external_user_id : "";

const describeError = (error: unknown, fallback: string) =>
  error instanceof ApiError
    ? error.status === 401
      ? "Sua sessão expirou. Entre novamente."
      : error.message
    : fallback;

const showError = (text1: string, text2?: string) =>
  Toast.show({ type: "error", text1, text2, position: "top" });

/**
 * Máquina de estados da vinculação de contas (artboard 5a), espelhando o fluxo web:
 *
 * - Xbox: `connect-url` → login Microsoft no navegador → deep link de retorno.
 * - Steam: modal pede a Web API Key → `connect-url` → login OpenID no navegador.
 * - PSN e RetroAchievements: o backend emite o código `PRISMA-XXXX`, o usuário o
 *   cola no perfil e o `connect` só vincula quando o código aparece lá.
 */
export const useConnectPlatforms = () => {
  const router = useRouter();
  const token = useSession((state) => state.token);

  const [statuses, setStatuses] = useState<Record<PlatformSlug, PlatformStatus>>(byStatus);
  const [handles, setHandles] = useState<Record<PlatformSlug, string>>(byHandle);
  const [forms, setForms] = useState<Record<PlatformSlug, string[]>>(byForm);
  const [codes, setCodes] = useState<Partial<Record<PlatformSlug, IssuedCode>>>({});
  const [openSlug, setOpenSlug] = useState<PlatformSlug | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [codeLoading, setCodeLoading] = useState(false);

  /** Evita `setState` depois que a tela saiu da pilha no meio de uma requisição. */
  const mounted = useRef(true);
  useEffect(
    () => () => {
      mounted.current = false;
    },
    [],
  );

  const setStatus = useCallback((slug: PlatformSlug, status: PlatformStatus) => {
    setStatuses((current) => ({ ...current, [slug]: status }));
  }, []);

  /** Sincroniza os cards com as contas vinculadas no backend. */
  const refresh = useCallback(async () => {
    if (!token) return;
    const { platforms } = await platformService.list(token);
    if (!mounted.current) return;

    const linked = new Map(platforms.map((account) => [account.platform, account]));
    setStatuses((current) =>
      Object.fromEntries(
        PLATFORMS.map(({ slug }) => [
          slug,
          current[slug] === "loading" ? "loading" : linked.has(slug) ? "on" : "off",
        ]),
      ) as Record<PlatformSlug, PlatformStatus>,
    );
    setHandles((current) =>
      Object.fromEntries(
        PLATFORMS.map(({ slug }) => {
          const account = linked.get(slug);
          // O PSN ID digitado ao vincular vale mais que o accountId numérico.
          return [slug, account ? current[slug] || handleOf(account) : ""];
        }),
      ) as Record<PlatformSlug, string>,
    );
  }, [token]);

  useEffect(() => {
    refresh().catch((error) =>
      showError("Não foi possível carregar suas contas", describeError(error, "Tente novamente.")),
    );
  }, [refresh]);

  const openPlatform = useMemo(
    () => PLATFORMS.find((platform) => platform.slug === openSlug) ?? null,
    [openSlug],
  );

  /** Busca um código novo quando não há um válido para a plataforma. */
  const issueCode = useCallback(
    async (slug: PlatformSlug, force = false) => {
      const current = codes[slug];
      if (!token || (!force && current && current.expiresAt - CODE_EXPIRY_MARGIN > Date.now()))
        return;

      setCodeLoading(true);
      try {
        const issued = await platformService.verificationCode(slug, token);
        if (!mounted.current) return;
        setCodes((all) => ({
          ...all,
          [slug]: { ...issued, expiresAt: Date.now() + issued.expires_in * 1000 },
        }));
      } catch (error) {
        if (mounted.current)
          setModalError(describeError(error, "Não foi possível gerar o código de verificação."));
      } finally {
        if (mounted.current) setCodeLoading(false);
      }
    },
    [codes, token],
  );

  const closeModal = useCallback(() => {
    if (modalLoading) return;
    setOpenSlug(null);
    setModalError(null);
  }, [modalLoading]);

  /**
   * Abre a URL de autorização e espera o deep link
   * `prisma://connect?status=success|error&platform=…&message=…`.
   */
  const authorizeInBrowser = useCallback(
    async (slug: PlatformSlug, url: string) => {
      const result = await WebBrowser.openAuthSessionAsync(url, settings.CONNECT_REDIRECT_URL);
      if (!mounted.current) return;

      // Fechou o navegador ou cancelou: volta ao estado anterior sem alarde.
      if (result.type !== "success") {
        setStatus(slug, "off");
        return;
      }

      const { queryParams } = Linking.parse(result.url);
      if (queryParams?.status !== "success") {
        setStatus(slug, "off");
        const message = queryParams?.message;
        showError(
          "Não foi possível vincular a conta",
          typeof message === "string" ? message : undefined,
        );
        return;
      }

      setStatus(slug, "on");
      await refresh().catch(() => undefined);
    },
    [refresh, setStatus],
  );

  const startOAuth = useCallback(
    async (slug: "steam" | "xbox", apiKey?: string) => {
      if (!token) return;
      setStatus(slug, "loading");
      try {
        const { url } = await platformService.connectUrl(slug, token, apiKey);
        await authorizeInBrowser(slug, url);
      } catch (error) {
        if (!mounted.current) return;
        setStatus(slug, "off");
        showError("Não foi possível vincular a conta", describeError(error, "Tente novamente."));
      }
    },
    [authorizeInBrowser, setStatus, token],
  );

  const disconnect = useCallback(
    async (platform: Platform) => {
      if (!token) return;
      const { slug } = platform;
      setStatus(slug, "loading");
      try {
        await platformService.disconnect(slug, token);
        if (!mounted.current) return;
        setStatus(slug, "off");
        setHandles((current) => ({ ...current, [slug]: "" }));
      } catch (error) {
        if (!mounted.current) return;
        setStatus(slug, "on");
        showError(
          `Não foi possível desvincular ${platform.name}`,
          describeError(error, "Tente novamente."),
        );
      }
    },
    [setStatus, token],
  );

  /** Como no web, desvincular pede confirmação: os dados sincronizados somem. */
  const confirmDisconnect = useCallback(
    (platform: Platform) => {
      Alert.alert(
        `Desvincular ${platform.name}?`,
        "Todos os jogos e conquistas sincronizados desta plataforma serão removidos do seu perfil.",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Desvincular", style: "destructive", onPress: () => disconnect(platform) },
        ],
      );
    },
    [disconnect],
  );

  /** Toque no botão do card: desvincula, abre o OAuth ou abre o formulário. */
  const toggle = useCallback(
    (platform: Platform) => {
      const status = statuses[platform.slug];
      if (status === "loading") return;

      if (status === "on") {
        confirmDisconnect(platform);
        return;
      }

      if (platform.authKind === "oauth") {
        startOAuth(platform.slug as "xbox");
        return;
      }

      setModalError(null);
      setOpenSlug(platform.slug);
      if (platform.ownershipCode) issueCode(platform.slug);
    },
    [confirmDisconnect, issueCode, startOAuth, statuses],
  );

  const setField = useCallback((slug: PlatformSlug, index: number, value: string) => {
    setModalError(null);
    setForms((current) => ({
      ...current,
      [slug]: current[slug].map((field, position) => (position === index ? value : field)),
    }));
  }, []);

  const openCode = openPlatform?.ownershipCode ? (codes[openPlatform.slug] ?? null) : null;

  /** O botão do modal só vincula com todos os campos preenchidos (e o código emitido). */
  const modalReady = useMemo(() => {
    if (!openPlatform) return false;
    if (openPlatform.ownershipCode && !openCode) return false;
    const values = forms[openPlatform.slug];
    return values.length > 0 && values.every((value) => value.trim().length > 0);
  }, [forms, openCode, openPlatform]);

  const submitModal = useCallback(async () => {
    if (!openPlatform || !modalReady || modalLoading || !token) return;

    const { slug, handleField } = openPlatform;
    const values = forms[slug].map((value) => value.trim());

    // Steam: a chave segue no `state` assinado; a posse é provada no login OpenID.
    if (slug === "steam") {
      setOpenSlug(null);
      startOAuth("steam", values[0]);
      return;
    }

    if (!openCode) return;

    setModalLoading(true);
    setModalError(null);
    setStatus(slug, "loading");
    try {
      await platformService.connect(slug, token, {
        username: values[0],
        api_key: values[1],
        verification_token: openCode.verification_token,
      });
      if (!mounted.current) return;

      setStatus(slug, "on");
      if (handleField !== undefined)
        setHandles((current) => ({ ...current, [slug]: values[handleField] }));
      setForms((current) => ({ ...current, [slug]: emptyForm(slug) }));
      // Como no web, cada vínculo usa um código novo.
      setCodes(({ [slug]: _used, ...rest }) => rest);
      setOpenSlug(null);
    } catch (error) {
      if (!mounted.current) return;
      setStatus(slug, "off");
      setModalError(describeError(error, "Não foi possível conectar ao servidor. Tente novamente."));
      // Código expirado: já emite outro para o usuário colar no perfil.
      if (error instanceof ApiError && error.status === 410) issueCode(slug, true);
    } finally {
      if (mounted.current) setModalLoading(false);
    }
  }, [
    forms,
    issueCode,
    modalLoading,
    modalReady,
    openCode,
    openPlatform,
    setStatus,
    startOAuth,
    token,
  ]);

  const connected = useMemo(
    () => PLATFORMS.filter((platform) => statuses[platform.slug] === "on").length,
    [statuses],
  );

  const busy = useMemo(
    () => PLATFORMS.some((platform) => statuses[platform.slug] === "loading"),
    [statuses],
  );

  /** Cada plataforma vinculada acende seu feixe no topo. */
  const beams = useMemo(
    () =>
      CONNECT_BEAMS.map((beam) => ({
        ...beam,
        opacity: statuses[beam.id as PlatformSlug] === "on" ? 1 : BEAM_OFF_OPACITY,
      })),
    [statuses],
  );

  const cards = useMemo(
    () =>
      PLATFORMS.map((platform) => {
        const status = statuses[platform.slug];
        const handle = handles[platform.slug];
        return {
          platform,
          status,
          description:
            status === "on"
              ? handle
                ? `Conectado · ${handle}`
                : "Conectado"
              : status === "loading"
                ? platform.loading
                : platform.idle,
        };
      }),
    [handles, statuses],
  );

  const finish = useCallback(() => {
    if (busy || connected === 0) return;
    // TODO(api): disparar a sincronização inicial quando a API expuser a rota.
    router.replace("/home");
  }, [busy, connected, router]);

  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  }, [router]);

  return {
    cards,
    beams,
    toggle,

    connected,
    counterLabel:
      connected === 0
        ? "Nenhuma conta vinculada"
        : `${connected} de ${PLATFORMS.length} contas vinculadas`,
    /** Um segmento por plataforma, aceso na cor da marca quando vinculada. */
    segments: PLATFORMS.map((platform) =>
      statuses[platform.slug] === "on" ? platform.color : COLORS.track,
    ),

    finish,
    finishLabel: connected > 0 ? "Concluir e sincronizar" : "Vincule ao menos uma conta",
    /** Sem nenhuma conta (ou com um vínculo em curso) o botão fica esmaecido. */
    finishDimmed: connected === 0 || busy,

    modal: openPlatform,
    modalValues: openPlatform ? forms[openPlatform.slug] : [],
    setField,
    modalReady,
    modalLoading,
    modalError,
    verificationCode: openCode?.code ?? null,
    codeLoading,
    regenerateCode: () => openPlatform && issueCode(openPlatform.slug, true),
    submitModal,
    closeModal,

    goBack,
  };
};
