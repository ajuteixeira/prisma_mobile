import { Callout, GradientButton, Icon, IconButton, Sheet } from "@/components/ui";
import { COLORS } from "@/constants";
import { MAX_PINS, usePinAchievements } from "@/hooks/_use-pin-achievements";
import type { AchievementOption, PinnedAchievement } from "@/services";
import { Image } from "expo-image";
import { memo, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from "react-native";

/** Mesmo atraso da busca da web (`phx-debounce="300"`). */
const SEARCH_DEBOUNCE_MS = 300;

const keyOf = (achievement: AchievementOption) => String(achievement.id);

const AchievementRow = memo(
  ({
    achievement,
    order,
    onToggle,
  }: {
    achievement: AchievementOption;
    /** Posição na seleção (1 a 4), ou `null` quando não está selecionada. */
    order: number | null;
    onToggle: (id: number) => void;
  }) => {
    const [broken, setBroken] = useState(false);
    const selected = order !== null;

    return (
      <Pressable
        accessibilityRole="checkbox"
        accessibilityLabel={selected ? `${achievement.name}, fixada` : achievement.name}
        accessibilityState={{ checked: selected }}
        onPress={() => onToggle(achievement.id)}
        className={`mb-2 flex-row items-center gap-3 rounded-2xl border px-3 py-2.5 ${
          selected ? "border-prisma-accent/50 bg-prisma-accent/10" : "border-white/[0.06] bg-white/[0.03]"
        }`}
      >
        <View className="h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-white/[0.06]">
          {achievement.icon_url && !broken ? (
            <Image
              source={{ uri: achievement.icon_url }}
              style={{ width: 44, height: 44 }}
              contentFit="cover"
              onError={() => setBroken(true)}
            />
          ) : (
            <Icon name="trophy" size={18} color={COLORS.faint} />
          )}
        </View>
        <View className="min-w-0 flex-1">
          <Text numberOfLines={1} className="text-[14.5px] font-semibold text-prisma-ink">
            {achievement.name}
          </Text>
          <Text numberOfLines={1} className="mt-0.5 text-[12.5px] text-prisma-muted">
            {achievement.game_name}
          </Text>
        </View>
        <View
          className={`h-7 w-7 items-center justify-center rounded-full border ${
            selected ? "border-prisma-accent bg-prisma-accent" : "border-white/[0.15]"
          }`}
        >
          {selected ? <Text className="text-[12px] font-bold text-white">{order}</Text> : null}
        </View>
      </Pressable>
    );
  },
);

AchievementRow.displayName = "AchievementRow";

type PinAchievementsFormProps = {
  pinned: PinnedAchievement[];
  onClose: () => void;
  onSaved: () => void;
};

/** Conteúdo da sheet: monta a cada abertura, então começa sempre das fixadas salvas. */
const PinAchievementsForm = ({ pinned, onClose, onSaved }: PinAchievementsFormProps) => {
  const [query, setQuery] = useState("");
  const [term, setTerm] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setTerm(query.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  const { list, selected, toggle, error, saving, save } = usePinAchievements(pinned, term, onSaved);
  const message = error ?? (list.items !== null ? list.error : null);

  let empty;
  if (list.items === null && list.error) {
    empty = (
      <View className="gap-3">
        <Callout tone="danger">{list.error}</Callout>
        <Pressable
          accessibilityRole="button"
          onPress={list.reset}
          className="h-11 items-center justify-center self-start rounded-xl border border-white/[0.08] bg-white/[0.06] px-4"
        >
          <Text className="text-[14px] font-semibold text-prisma-body">Tentar novamente</Text>
        </Pressable>
      </View>
    );
  } else if (list.items === null) {
    empty = (
      <View accessibilityLabel="Carregando conquistas" className="h-[200px] items-center justify-center">
        <ActivityIndicator color={COLORS.accent} />
      </View>
    );
  } else {
    empty = (
      <View className="items-center px-5 pt-10">
        <Icon name="trophy" size={26} color={COLORS.faint} />
        <Text className="mt-3 text-center text-[13.5px] text-prisma-faint">
          {term ? "Nenhuma conquista encontrada." : "Você ainda não desbloqueou conquistas."}
        </Text>
      </View>
    );
  }

  return (
    <>
      <View className="flex-row items-center justify-between pb-1 pl-6 pr-5 pt-[22px]">
        <View>
          <Text className="text-[21px] font-bold text-white" style={{ letterSpacing: -0.3 }}>
            Fixar conquistas
          </Text>
          <Text className="mt-0.5 text-[12.5px] text-prisma-muted">
            {selected.length}/{MAX_PINS} selecionadas
          </Text>
        </View>
        <IconButton
          icon="close"
          variant="ghost"
          color={COLORS.muted}
          accessibilityLabel="Fechar pinagem"
          onPress={onClose}
          className="h-[38px] w-[38px]"
        />
      </View>

      <View className="mx-6 mt-3 h-[46px] flex-row items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.045] px-4">
        <Icon name="search" size={14} color={COLORS.accent} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar conquista ou jogo"
          placeholderTextColor={COLORS.faint}
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="Buscar conquista ou jogo"
          className="flex-1 text-[16px] text-prisma-body"
        />
      </View>

      {message ? (
        <View className="mx-6 mt-3">
          <Callout tone="danger">{message}</Callout>
        </View>
      ) : null}

      <FlatList
        testID="pin-achievement-list"
        data={list.items ?? []}
        keyExtractor={keyOf}
        renderItem={({ item }) => {
          const index = selected.indexOf(item.id);
          return (
            <AchievementRow
              achievement={item}
              order={index === -1 ? null : index + 1}
              onToggle={toggle}
            />
          );
        }}
        extraData={selected}
        ListEmptyComponent={empty}
        ListFooterComponent={
          list.loadingMore ? (
            <View className="py-4">
              <ActivityIndicator color={COLORS.accent} />
            </View>
          ) : null
        }
        onEndReached={list.loadMore}
        onEndReachedThreshold={0.5}
        className="flex-1"
        contentContainerClassName="px-6 pb-4 pt-3"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />

      <View className="flex-row gap-2.5 border-t border-white/[0.05] px-6 pb-6 pt-3.5">
        <Pressable
          accessibilityRole="button"
          onPress={onClose}
          disabled={saving}
          className="h-14 flex-1 items-center justify-center rounded-[18px] border border-white/[0.08] bg-white/[0.06]"
        >
          <Text className="text-[15.5px] font-semibold text-prisma-body">Cancelar</Text>
        </Pressable>
        <View style={{ flex: 1.4 }}>
          <GradientButton
            accessibilityLabel="Salvar conquistas fixadas"
            label={saving ? "Salvando…" : "Salvar"}
            loading={saving}
            height={56}
            onPress={save}
          />
        </View>
      </View>
    </>
  );
};

type PinAchievementsSheetProps = PinAchievementsFormProps & { visible: boolean };

/**
 * "Gerenciar" das conquistas fixadas, como o modal da web: busca, lista
 * paginada das desbloqueadas e até 4 selecionadas, na ordem do toque.
 */
export const PinAchievementsSheet = memo(({ visible, ...props }: PinAchievementsSheetProps) => (
  <Sheet visible={visible} onClose={props.onClose} heightRatio={0.88}>
    {visible ? <PinAchievementsForm {...props} /> : null}
  </Sheet>
));

PinAchievementsSheet.displayName = "PinAchievementsSheet";
