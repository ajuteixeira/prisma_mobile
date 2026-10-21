import { Icon, type IconName } from "@/components/ui/_icon";
import { COLORS, PLATFORMS, type PlatformSlug } from "@/constants";
import type { SyncStatus } from "@/services";
import { dismissSync, minimizeSync, restoreSync, useSync } from "@/store";
import { formatCount } from "@/utils";
import { MotiView } from "moti";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Altura da `PrismaTabBar`. */
const TAB_BAR_HEIGHT = 66;
/** Espaço entre a `PrismaTabBar` e o banner. */
const GAP = 10;

const platformName = (slug: PlatformSlug) =>
  PLATFORMS.find((platform) => platform.slug === slug)?.name ?? slug;

/**
 * Percentual geral: contas concluídas mais a fração de jogos da conta atual.
 * Limitado a 99 enquanto `running`. Retorna 100 quando parado.
 */
export const syncPercent = (status: SyncStatus) => {
  if (!status.running) return 100;
  const { current } = status;
  const fraction = current?.games_total ? current.games_done / current.games_total : 0;
  const total = Math.max(status.accounts_total, 1);
  return Math.min(99, Math.round(((status.accounts_done + fraction) / total) * 100));
};

type Content = {
  icon: IconName | null;
  tone: string;
  title: string;
  message: string;
};

const describeSync = (status: SyncStatus): Content => {
  if (status.running) {
    const { current } = status;
    let message = "Preparando suas contas…";
    if (current) {
      message =
        current.games_total === null
          ? `${platformName(current.platform)} · buscando jogos…`
          : `${platformName(current.platform)} · ${formatCount(current.games_done)} de ${formatCount(current.games_total)} jogos`;
    }
    return {
      icon: null,
      tone: COLORS.accent,
      title: "Sincronizando suas contas",
      message,
    };
  }

  const failed = status.platforms.filter((item) => item.sync_status === "failed");
  if (failed.length > 0) {
    const names = failed.map((item) => platformName(item.platform)).join(", ");
    return {
      icon: "alert",
      tone: COLORS.danger,
      title: "Sincronização interrompida",
      message: `Não foi possível sincronizar ${names}. Tente novamente mais tarde.`,
    };
  }

  return {
    icon: "checkCircle",
    tone: COLORS.success,
    title: "Sincronização concluída",
    message: `${formatCount(status.games_synced)} jogos e ${formatCount(status.achievements_synced)} conquistas sincronizados.`,
  };
};

const StatusIcon = ({ icon, tone }: Pick<Content, "icon" | "tone">) => (
  <View
    className="h-10 w-10 items-center justify-center rounded-xl"
    style={{ backgroundColor: `${tone}26` }}
  >
    {icon ? <Icon name={icon} size={18} color={tone} /> : <ActivityIndicator color={tone} />}
  </View>
);

/**
 * Banner com o progresso da sincronização, acima da `PrismaTabBar`. Não renderiza
 * sem estado ou com `visible` falso. Minimizado, mostra só o percentual.
 */
export const SyncBanner = () => {
  const insets = useSafeAreaInsets();
  const status = useSync((state) => state.status);
  const visible = useSync((state) => state.visible);
  const minimized = useSync((state) => state.minimized);

  if (!status || !visible) return null;

  const bottom = Math.max(insets.bottom, 12) + 14 + TAB_BAR_HEIGHT + GAP;
  const percent = syncPercent(status);
  const content = describeSync(status);

  if (minimized) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Mostrar sincronização, ${percent}%`}
        onPress={restoreSync}
        className="absolute right-3.5 h-10 flex-row items-center gap-2 rounded-full border border-white/10 px-3.5"
        style={{ bottom, backgroundColor: "rgba(18, 22, 29, 0.94)" }}
      >
        {content.icon ? (
          <Icon name={content.icon} size={14} color={content.tone} />
        ) : (
          <ActivityIndicator size="small" color={content.tone} />
        )}
        <Text className="text-[12.5px] font-semibold text-prisma-body">
          {status.running ? `${percent}%` : content.title}
        </Text>
      </Pressable>
    );
  }

  return (
    <MotiView
      from={{ opacity: 0, translateY: 12 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 200 }}
      accessibilityRole="summary"
      accessibilityLiveRegion="polite"
      className="absolute left-3.5 right-3.5 flex-row items-center gap-3 rounded-[20px] border border-white/10 px-3.5 py-3"
      style={{
        bottom,
        backgroundColor: "rgba(18, 22, 29, 0.94)",
        boxShadow: "0px 12px 32px rgba(0, 0, 0, 0.45)",
      }}
    >
      <StatusIcon icon={content.icon} tone={content.tone} />

      <View className="min-w-0 flex-1">
        <Text className="text-[14px] font-bold text-prisma-ink">{content.title}</Text>
        <Text className="mt-0.5 text-[12px] leading-[17px] text-prisma-muted" numberOfLines={2}>
          {content.message}
        </Text>

        {status.running ? (
          <View className="mt-2 flex-row items-center gap-2">
            <View className="h-1.5 flex-1 overflow-hidden rounded-full bg-prisma-track">
              <View
                className="h-full rounded-full bg-prisma-accent"
                style={{ width: `${percent}%` }}
              />
            </View>
            <Text className="text-[11px] font-semibold text-prisma-muted">{percent}%</Text>
          </View>
        ) : null}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          status.running ? "Minimizar sincronização" : "Fechar aviso de sincronização"
        }
        hitSlop={8}
        onPress={status.running ? minimizeSync : dismissSync}
        className="h-8 w-8 items-center justify-center rounded-[10px] bg-white/[0.06]"
      >
        <Icon name={status.running ? "chevronDown" : "close"} size={12} color={COLORS.muted} />
      </Pressable>
    </MotiView>
  );
};
