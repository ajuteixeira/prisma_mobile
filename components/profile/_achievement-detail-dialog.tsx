import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
} from "@/components/ui/alert-dialog";
import { Callout, Icon, IconButton } from "@/components/ui";
import { COLORS } from "@/constants";
import { profileApi, type AchievementDetail } from "@/services";
import { useSession } from "@/store";
import { formatUnlockDate } from "@/utils";
import { Image } from "expo-image";
import { memo, useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

const LOAD_ERROR = "Não foi possível carregar a conquista.";

/** Busca a conquista a cada id aberto; o resultado de um id anterior é ignorado. */
const useAchievementDetail = (id: number | null) => {
  const token = useSession((state) => state.token);
  const [attempt, setAttempt] = useState(0);
  const key = `${id}:${attempt}`;
  const [result, setResult] = useState<{
    key: string;
    data: AchievementDetail | null;
    error: string | null;
  } | null>(null);

  useEffect(() => {
    if (id === null || !token) return;
    let current = true;
    profileApi
      .achievement(token, id)
      .then(({ achievement }) => current && setResult({ key, data: achievement, error: null }))
      .catch(() => current && setResult({ key, data: null, error: LOAD_ERROR }));
    return () => {
      current = false;
    };
  }, [id, key, token]);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);
  const fresh = result?.key === key ? result : null;
  return { data: fresh?.data ?? null, error: fresh?.error ?? null, retry };
};

const DetailBody = ({ achievement }: { achievement: AchievementDetail }) => {
  const [broken, setBroken] = useState(false);

  return (
    <View className="items-center">
      <View className="h-24 w-24 items-center justify-center overflow-hidden rounded-[22px] border border-white/[0.08] bg-white/[0.06]">
        {achievement.icon_url && !broken ? (
          <Image
            testID="achievement-detail-image"
            source={{ uri: achievement.icon_url }}
            style={{ width: 96, height: 96 }}
            contentFit="cover"
            onError={() => setBroken(true)}
          />
        ) : (
          <Icon name="trophy" size={36} color={COLORS.accent} />
        )}
      </View>

      <Text className="mt-4 text-center text-[19px] font-bold text-white">{achievement.name}</Text>

      {achievement.game_name ? (
        <View className="mt-2 rounded-full border border-prisma-accent/30 bg-prisma-accent/15 px-3 py-1">
          <Text className="text-[12px] font-semibold text-prisma-accent">
            {achievement.game_name}
          </Text>
        </View>
      ) : null}

      {achievement.description ? (
        <Text className="mt-4 text-center text-[14px] leading-5 text-slate-300">
          {achievement.description}
        </Text>
      ) : null}

      <View className="mt-4 flex-row items-center gap-1.5">
        <Icon name="checkCircle" size={12} color={COLORS.faint} />
        <Text className="text-[12.5px] text-prisma-faint">
          {formatUnlockDate(achievement.unlocked_at)}
        </Text>
      </View>
    </View>
  );
};

type AchievementDetailDialogProps = {
  /** Conquista aberta (id de `profile_achievements`); `null` fecha o diálogo. */
  achievementId: number | null;
  onClose: () => void;
};

/**
 * "Detalhes da conquista", como o modal da web: ícone, nome, jogo, descrição e
 * data de desbloqueio, buscados na API ao tocar numa conquista fixada.
 */
export const AchievementDetailDialog = memo(
  ({ achievementId, onClose }: AchievementDetailDialogProps) => {
    const { data, error, retry } = useAchievementDetail(achievementId);

    let body;
    if (data) {
      body = <DetailBody achievement={data} />;
    } else if (error) {
      body = (
        <View className="gap-3">
          <Callout tone="danger">{error}</Callout>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Tentar carregar a conquista de novo"
            onPress={retry}
            className="h-11 items-center justify-center self-start rounded-xl border border-white/[0.08] bg-white/[0.06] px-4"
          >
            <Text className="text-[14px] font-semibold text-prisma-body">Tentar novamente</Text>
          </Pressable>
        </View>
      );
    } else {
      body = (
        <View accessibilityLabel="Carregando conquista" className="h-[220px] items-center justify-center">
          <ActivityIndicator color={COLORS.accent} />
        </View>
      );
    }

    return (
      <AlertDialog isOpen={achievementId !== null} onClose={onClose}>
        {/* O backdrop do gluestack para em 50% de opacidade; o escurecimento real vem da cor. */}
        <AlertDialogBackdrop
          animate={{ opacity: 1 }}
          style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
        />
        <AlertDialogContent
          className="w-[88%] max-w-[400px] rounded-[26px] border-prisma-sheet-border bg-prisma-surface p-6"
          style={{ boxShadow: "0px 24px 60px rgba(0, 0, 0, 0.6)" }}
        >
          <AlertDialogHeader className="flex-row items-center justify-between">
            <Text className="text-[18px] font-bold text-white" style={{ letterSpacing: -0.3 }}>
              Detalhes da conquista
            </Text>
            <IconButton
              icon="close"
              variant="ghost"
              color={COLORS.muted}
              accessibilityLabel="Fechar detalhes"
              onPress={onClose}
              className="h-[34px] w-[34px]"
            />
          </AlertDialogHeader>

          <AlertDialogBody className="mt-5">{body}</AlertDialogBody>

          <AlertDialogFooter className="mt-6">
            <Pressable
              accessibilityRole="button"
              onPress={onClose}
              className="h-[52px] flex-1 items-center justify-center rounded-2xl border border-prisma-ghost-border bg-prisma-ghost-bg"
            >
              <Text className="text-[15px] font-semibold text-prisma-body">Fechar</Text>
            </Pressable>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  },
);

AchievementDetailDialog.displayName = "AchievementDetailDialog";
