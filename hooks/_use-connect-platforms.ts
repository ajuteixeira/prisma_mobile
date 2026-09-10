import type { Platform, PlatformSlug } from "@/constants";
import { BEAM_OFF_OPACITY, COLORS, CONNECT_BEAMS, PLATFORMS } from "@/constants";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/** Estado de cada card: desvinculado, autenticando ou vinculado. */
export type PlatformStatus = "off" | "loading" | "on";

/** Latências simuladas enquanto a integração com a API não existe. */
const OAUTH_DELAY = 1300;
const LINK_DELAY = 1400;
const SYNC_DELAY = 1600;

const byStatus = () =>
  Object.fromEntries(PLATFORMS.map((platform) => [platform.slug, "off"])) as Record<
    PlatformSlug,
    PlatformStatus
  >;

/** Um valor por campo declarado no catálogo. */
const byForm = () =>
  Object.fromEntries(
    PLATFORMS.map((platform) => [platform.slug, (platform.fields ?? []).map(() => "")]),
  ) as Record<PlatformSlug, string[]>;

const byHandle = () =>
  Object.fromEntries(PLATFORMS.map((platform) => [platform.slug, ""])) as Record<
    PlatformSlug,
    string
  >;

/**
 * Máquina de estados da vinculação de contas (artboard 5a).
 *
 * Plataformas OAuth abrem a autenticação do provedor; as demais pedem chave ou
 * token num modal antes de vincular. Todas as chamadas de rede estão simuladas —
 * os pontos de troca estão marcados com `TODO(api)`.
 */
export const useConnectPlatforms = () => {
  const router = useRouter();

  const [statuses, setStatuses] = useState<Record<PlatformSlug, PlatformStatus>>(byStatus);
  const [handles, setHandles] = useState<Record<PlatformSlug, string>>(byHandle);
  const [forms, setForms] = useState<Record<PlatformSlug, string[]>>(byForm);
  const [openSlug, setOpenSlug] = useState<PlatformSlug | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [finishing, setFinishing] = useState(false);

  /** Há vários temporizadores simultâneos (OAuth, modal, sync). */
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);
  const schedule = useCallback((task: () => void, delay: number) => {
    timeouts.current.push(setTimeout(task, delay));
  }, []);
  useEffect(
    () => () => {
      timeouts.current.forEach(clearTimeout);
      timeouts.current = [];
    },
    [],
  );

  const setStatus = useCallback((slug: PlatformSlug, status: PlatformStatus) => {
    setStatuses((current) => ({ ...current, [slug]: status }));
  }, []);

  const openPlatform = useMemo(
    () => PLATFORMS.find((platform) => platform.slug === openSlug) ?? null,
    [openSlug],
  );

  const closeModal = useCallback(() => {
    if (modalLoading) return;
    setOpenSlug(null);
  }, [modalLoading]);

  const disconnect = useCallback(
    (slug: PlatformSlug) => {
      // TODO(api): DELETE /api/platforms/:slug antes de apagar o estado local.
      setStatus(slug, "off");
      setHandles((current) => ({ ...current, [slug]: "" }));
    },
    [setStatus],
  );

  /** Toque no botão do card: desvincula, abre o OAuth ou abre o formulário. */
  const toggle = useCallback(
    (platform: Platform) => {
      const status = statuses[platform.slug];
      if (status === "loading" || finishing) return;

      if (status === "on") {
        disconnect(platform.slug);
        return;
      }

      if (platform.authKind === "oauth") {
        setStatus(platform.slug, "loading");
        // TODO(api): POST /api/platforms/:slug/connect-url, abrir a URL devolvida
        // no navegador e aguardar o deep link prisma://connect?status=…
        schedule(() => setStatus(platform.slug, "on"), OAUTH_DELAY);
        return;
      }

      setOpenSlug(platform.slug);
    },
    [disconnect, finishing, schedule, setStatus, statuses],
  );

  const setField = useCallback(
    (slug: PlatformSlug, index: number, value: string) => {
      setForms((current) => ({
        ...current,
        [slug]: current[slug].map((field, position) => (position === index ? value : field)),
      }));
    },
    [],
  );

  /** O botão do modal só vincula quando todos os campos têm conteúdo. */
  const modalReady = useMemo(() => {
    if (!openPlatform) return false;
    const values = forms[openPlatform.slug];
    return values.length > 0 && values.every((value) => value.trim().length > 0);
  }, [forms, openPlatform]);

  const submitModal = useCallback(() => {
    if (!openPlatform || !modalReady || modalLoading) return;

    const { slug, handleField } = openPlatform;
    setModalLoading(true);
    setStatus(slug, "loading");

    // TODO(api): enviar os campos para a rota de conexão da plataforma. O
    // identificador exibido no card virá do `external_user_id` da resposta.
    schedule(() => {
      setModalLoading(false);
      setOpenSlug(null);
      setStatus(slug, "on");
      if (handleField !== undefined) {
        setHandles((current) => ({ ...current, [slug]: forms[slug][handleField].trim() }));
      }
    }, LINK_DELAY);
  }, [forms, modalLoading, modalReady, openPlatform, schedule, setStatus]);

  const connected = useMemo(
    () => PLATFORMS.filter((platform) => statuses[platform.slug] === "on").length,
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
    if (finishing || connected === 0) return;
    setFinishing(true);
    // TODO(api): disparar a sincronização inicial e aguardar a confirmação.
    schedule(() => {
      setFinishing(false);
      router.replace("/home");
    }, SYNC_DELAY);
  }, [connected, finishing, router, schedule]);

  const goBack = useCallback(() => {
    if (finishing) return;
    if (router.canGoBack()) router.back();
    else router.replace("/");
  }, [finishing, router]);

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
    finishing,
    finishLabel: finishing
      ? "Sincronizando…"
      : connected > 0
        ? "Concluir e sincronizar"
        : "Vincule ao menos uma conta",
    /** Sem nenhuma conta o botão fica esmaecido, como no protótipo. */
    finishDimmed: connected === 0,

    modal: openPlatform,
    modalValues: openPlatform ? forms[openPlatform.slug] : [],
    setField,
    modalReady,
    modalLoading,
    submitModal,
    closeModal,

    goBack,
  };
};
