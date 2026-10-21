import { FollowRow } from "@/components/followers";
import { Callout, Icon } from "@/components/ui";
import { COLORS } from "@/constants";
import { useFollowCounts, useFollowList } from "@/hooks";
import { followsApi, type FollowProfile } from "@/services";
import { useSession } from "@/store";
import { describeApiError, openUserProfile } from "@/utils";
import { useFocusEffect, useRouter, useScrollToTop } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

type Tab = "followers" | "following" | "search";

/** Mesmo atraso da busca da web (`phx-debounce="300"`). */
const SEARCH_DEBOUNCE_MS = 300;

const SECTIONS: Record<Tab, { title: string; empty: string }> = {
  followers: { title: "QUEM SEGUE VOCÊ", empty: "Nenhum seguidor ainda." },
  following: { title: "VOCÊ SEGUE", empty: "Você ainda não segue ninguém." },
  search: { title: "PESSOAS", empty: "Nenhum resultado encontrado." },
};

/** Texto da busca depois do debounce, já sem espaços nas pontas. */
const useDebounced = (value: string) => {
  const [debounced, setDebounced] = useState(value.trim());
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [value]);
  return debounced;
};

const keyOf = (person: FollowProfile) => String(person.profile_id);

/**
 * Seguidores (artboard 6c): as três abas da web num segmented control, cada
 * uma carregada aos poucos ao rolar. Pesquisar lista todo mundo em ordem
 * alfabética e filtra por username ao digitar.
 */
export default function FollowersScreen() {
  const router = useRouter();
  const token = useSession((state) => state.token);
  const counts = useFollowCounts();
  const [tab, setTab] = useState<Tab>("followers");
  const [query, setQuery] = useState("");
  const term = useDebounced(query);
  const followers = useFollowList("followers");
  const following = useFollowList("following");
  const search = useFollowList("search", term);
  const active = tab === "followers" ? followers : tab === "following" ? following : search;
  const reset = active.reset;
  // Estado de follow já trocado na tela, à espera da resposta da API.
  const [overrides, setOverrides] = useState<Record<number, boolean>>({});
  const [toggleError, setToggleError] = useState<string | null>(null);
  // Tocar na aba Seguidores já aberta volta ao topo, já que a lista não tem fim.
  const listRef = useRef<FlatList<FollowProfile>>(null);
  useScrollToTop(listRef);

  // Voltar de um perfil aberto daqui mantém a lista e a rolagem.
  const returningFromProfile = useRef(false);

  // A aba aberta recomeça do topo ao focar a tela, ao trocar de aba e a cada busca.
  useFocusEffect(
    useCallback(() => {
      if (returningFromProfile.current) {
        returningFromProfile.current = false;
        return;
      }
      reset();
    }, [reset]),
  );

  const openProfile = useCallback(
    (person: FollowProfile) => {
      returningFromProfile.current = true;
      openUserProfile(router, person.username);
    },
    [router],
  );

  const updateFollowers = followers.update;
  const updateFollowing = following.update;
  const updateSearch = search.update;
  const reloadCounts = counts.reload;

  const toggle = useCallback(
    async (person: FollowProfile) => {
      if (!token) return;
      const id = person.profile_id;
      const next = !(overrides[id] ?? person.is_following);
      const clear = () => setOverrides(({ [id]: _, ...rest }) => rest);
      const apply = (items: FollowProfile[]) =>
        items.map((item) => (item.profile_id === id ? { ...item, is_following: next } : item));

      setToggleError(null);
      setOverrides((current) => ({ ...current, [id]: next }));
      try {
        await (next ? followsApi.follow : followsApi.unfollow)(token, id);
        // Atualiza as listas no lugar em vez de rebuscar, para não voltar ao topo;
        // quem você deixa de seguir sai de Seguindo, como na web.
        updateFollowers(apply);
        updateSearch(apply);
        updateFollowing((items) =>
          next ? apply(items) : items.filter((item) => item.profile_id !== id),
        );
        await reloadCounts();
      } catch (toggleFailure) {
        setToggleError(describeApiError(toggleFailure));
      }
      clear();
    },
    [overrides, reloadCounts, token, updateFollowers, updateFollowing, updateSearch],
  );

  const withOverride = (person: FollowProfile) =>
    person.profile_id in overrides
      ? { ...person, is_following: overrides[person.profile_id] }
      : person;

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "followers", label: "Seguidores", count: counts.data?.followers_count ?? 0 },
    { id: "following", label: "Seguindo", count: counts.data?.following_count ?? 0 },
    { id: "search", label: "Pesquisar" },
  ];

  const list = (active.items ?? []).map(withOverride);
  const loadError = active.items === null ? active.error : null;
  const errorMessage = toggleError ?? (active.items !== null ? active.error : null);
  const initialLoading = active.items === null && !loadError;

  const header = (
    <>
      <View className="mt-1.5 flex-row gap-1 rounded-2xl border border-white/[0.07] bg-white/[0.045] p-1">
        {tabs.map((item) => {
          const selected = item.id === tab;
          return (
            <Pressable
              key={item.id}
              accessibilityRole="tab"
              accessibilityLabel={
                item.count === undefined ? item.label : `${item.label}, ${item.count}`
              }
              accessibilityState={{ selected }}
              onPress={() => setTab(item.id)}
              className={`h-10 flex-1 flex-row items-center justify-center gap-1.5 rounded-xl ${
                selected ? "bg-[#1f2633]" : ""
              }`}
            >
              <Text
                className={`text-[13.5px] font-semibold ${selected ? "text-prisma-ink" : "text-prisma-muted"}`}
              >
                {item.label}
              </Text>
              {item.count !== undefined ? (
                <Text
                  className={`text-[11.5px] opacity-70 ${selected ? "text-prisma-ink" : "text-prisma-muted"}`}
                >
                  {item.count}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      {tab === "search" ? (
        <View className="mt-3 h-[50px] flex-row items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.045] px-4">
          <Icon name="search" size={14} color={COLORS.accent} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar por username"
            placeholderTextColor={COLORS.faint}
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Buscar por username"
            className="flex-1 text-[16px] text-prisma-body"
          />
        </View>
      ) : null}

      {errorMessage ? (
        <View className="mt-3">
          <Callout tone="danger">{errorMessage}</Callout>
        </View>
      ) : null}

      {list.length > 0 ? (
        <Text className="mb-2.5 mt-[22px] text-[12px] font-semibold tracking-[1px] text-prisma-muted">
          {SECTIONS[tab].title}
        </Text>
      ) : null}
    </>
  );

  let empty = null;
  if (loadError) {
    empty = (
      <View className="mt-3 gap-3">
        <Callout tone="danger">{loadError}</Callout>
        <Pressable
          accessibilityRole="button"
          onPress={active.reset}
          className="h-11 items-center justify-center self-start rounded-xl border border-white/[0.08] bg-white/[0.06] px-4"
        >
          <Text className="text-[14px] font-semibold text-prisma-body">
            Tentar novamente
          </Text>
        </Pressable>
      </View>
    );
  } else if (initialLoading || active.loading) {
    empty = (
      <View
        accessibilityLabel="Carregando seguidores"
        className="h-[200px] items-center justify-center"
      >
        <ActivityIndicator color={COLORS.accent} />
      </View>
    );
  } else {
    empty = (
      <View className="items-center px-5 pt-10">
        <Icon name="users" size={26} color={COLORS.faint} />
        <Text className="mt-3 text-center text-[13.5px] text-prisma-faint">
          {SECTIONS[tab].empty}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-prisma-background">
      <StatusBar style="light" />
      <FlatList
        ref={listRef}
        testID="follow-list"
        data={list}
        keyExtractor={keyOf}
        renderItem={({ item }) => (
          <FollowRow person={item} onToggle={toggle} onOpen={openProfile} />
        )}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        ListFooterComponent={
          active.loadingMore ? (
            <View className="py-4">
              <ActivityIndicator color={COLORS.accent} />
            </View>
          ) : null
        }
        onEndReached={active.loadMore}
        onEndReachedThreshold={0.5}
        className="flex-1"
        contentContainerClassName="px-5 pb-[120px] pt-[58px]"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}
