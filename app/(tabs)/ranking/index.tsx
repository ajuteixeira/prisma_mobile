import {
  PlatformFilter,
  RankingRow,
  type RankingFilter,
} from "@/components/ranking";
import { Callout, Icon } from "@/components/ui";
import { COLORS } from "@/constants";
import { useRanking } from "@/hooks";
import type { RankingEntry } from "@/services";
import { openUserProfile } from "@/utils";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

type RankedEntry = { entry: RankingEntry; count: number };

/**
 * Mesmas regras da web: o filtro mantém só quem vinculou a plataforma e
 * reordena pelas conquistas dela; a busca filtra pelo nome.
 */
const rank = (
  entries: RankingEntry[],
  filter: RankingFilter,
  search: string,
): RankedEntry[] => {
  const term = search.trim().toLowerCase();
  const ranked = entries
    .filter((entry) => filter === "all" || entry.platforms.includes(filter))
    .filter((entry) => !term || entry.username.toLowerCase().includes(term))
    .map((entry) => ({
      entry,
      count:
        filter === "all"
          ? entry.achievement_count
          : (entry.platform_counts[filter] ?? 0),
    }));
  return filter === "all" ? ranked : ranked.sort((a, b) => b.count - a.count);
};

/** Ranking (artboard 6b): você e quem você segue, por conquistas desbloqueadas. */
export default function RankingScreen() {
  const router = useRouter();
  const { data, loading, error, reload } = useRanking();
  const [filter, setFilter] = useState<RankingFilter>("all");
  const [search, setSearch] = useState("");

  const ranked = useMemo(
    () => rank(data ?? [], filter, search),
    [data, filter, search],
  );

  const openProfile = useCallback(
    (entry: RankingEntry) =>
      entry.is_current_user
        ? router.navigate("/profile")
        : openUserProfile(router, entry.username),
    [router],
  );

  let empty = null;
  if (error) {
    empty = (
      <View className="gap-3">
        <Callout tone="danger">{error}</Callout>
        <Pressable
          accessibilityRole="button"
          onPress={reload}
          className="h-11 items-center justify-center self-start rounded-xl border border-white/[0.08] bg-white/[0.06] px-4"
        >
          <Text className="text-[14px] font-semibold text-prisma-body">
            Tentar novamente
          </Text>
        </Pressable>
      </View>
    );
  } else if (loading && !data) {
    empty = (
      <View
        accessibilityLabel="Carregando ranking"
        className="h-[200px] items-center justify-center"
      >
        <ActivityIndicator color={COLORS.accent} />
      </View>
    );
  } else {
    empty = (
      <Text className="py-8 text-center text-sm text-prisma-muted">
        Nenhum jogador encontrado.
      </Text>
    );
  }

  return (
    <View className="flex-1 bg-prisma-background">
      <StatusBar style="light" />
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-[120px] pt-[64px]"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-5 gap-4">
          <View>
            <Text className="text-[28px] font-bold text-prisma-ink">
              Ranking
            </Text>
            <Text className="mt-1 text-sm text-prisma-muted">
              Competição entre você e as pessoas que você segue
            </Text>
          </View>
          <View className="h-11 flex-row items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3">
            <Icon name="search" size={16} color={COLORS.faint} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar jogador..."
              placeholderTextColor={COLORS.faint}
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Buscar jogador"
              className="flex-1 text-[15px] text-prisma-body"
            />
          </View>
          <PlatformFilter value={filter} onChange={setFilter} />
        </View>

        {ranked.length > 0 ? (
          <View className="gap-2.5">
            {ranked.map((item, index) => (
              <RankingRow
                key={item.entry.profile_id}
                entry={item.entry}
                position={index + 1}
                count={item.count}
                onPress={openProfile}
              />
            ))}
          </View>
        ) : (
          empty
        )}
      </ScrollView>
    </View>
  );
}
