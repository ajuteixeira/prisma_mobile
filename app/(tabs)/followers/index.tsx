import { FollowRow } from "@/components/followers";
import { Callout, Icon } from "@/components/ui";
import { COLORS } from "@/constants";
import { useFollows } from "@/hooks";
import { followsApi, type FollowProfile } from "@/services";
import { useSession } from "@/store";
import { describeApiError } from "@/utils";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

type Tab = "followers" | "following" | "search";

/** Mesmo atraso da busca da web (`phx-debounce="300"`). */
const SEARCH_DEBOUNCE_MS = 300;

/**
 * Busca por username como a aba Pesquisar da web: texto vazio não busca e
 * limpa os resultados (`null`).
 */
const useFollowSearch = (token: string | null, query: string) => {
  const [results, setResults] = useState<FollowProfile[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const term = query.trim();

  const run = useCallback(async () => {
    if (!token || !term) {
      setResults(null);
      return;
    }
    try {
      setResults(await followsApi.search(token, term));
      setError(null);
    } catch (searchError) {
      setError(describeApiError(searchError));
    }
  }, [term, token]);

  useEffect(() => {
    const timer = setTimeout(run, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [run]);

  return { results, error, refresh: run };
};

/**
 * Seguidores (artboard 6c): as três abas da web num segmented control.
 * Seguir/Seguindo alterna na hora e depois recarrega as listas, como a web.
 */
export default function FollowersScreen() {
  const token = useSession((state) => state.token);
  const { data, loading, error, reload } = useFollows();
  const [tab, setTab] = useState<Tab>("followers");
  const [query, setQuery] = useState("");
  const search = useFollowSearch(token, query);
  // Estado de follow já trocado na tela, à espera da resposta da API.
  const [overrides, setOverrides] = useState<Record<number, boolean>>({});
  const [toggleError, setToggleError] = useState<string | null>(null);

  const withOverride = (person: FollowProfile) =>
    person.profile_id in overrides
      ? { ...person, is_following: overrides[person.profile_id] }
      : person;

  const toggle = useCallback(
    async (person: FollowProfile) => {
      if (!token) return;
      const id = person.profile_id;
      const next = !(overrides[id] ?? person.is_following);
      const clear = () =>
        setOverrides(({ [id]: _, ...rest }) => rest);

      setToggleError(null);
      setOverrides((current) => ({ ...current, [id]: next }));
      try {
        await (next ? followsApi.follow : followsApi.unfollow)(token, id);
        await Promise.all([reload(), search.refresh()]);
      } catch (toggleFailure) {
        setToggleError(describeApiError(toggleFailure));
      }
      clear();
    },
    [overrides, reload, search, token],
  );

  const followers = (data?.followers ?? []).map(withOverride);
  const following = (data?.following ?? []).map(withOverride);

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "followers", label: "Seguidores", count: data?.followers.length ?? 0 },
    { id: "following", label: "Seguindo", count: data?.following.length ?? 0 },
    { id: "search", label: "Pesquisar" },
  ];

  let list: FollowProfile[] = [];
  let section = "";
  let emptyText: string | null = null;
  if (tab === "followers") {
    list = followers;
    section = "QUEM SEGUE VOCÊ";
    emptyText = "Nenhum seguidor ainda.";
  } else if (tab === "following") {
    list = following;
    section = "VOCÊ SEGUE";
    emptyText = "Você ainda não segue ninguém.";
  } else {
    list = (search.results ?? []).map(withOverride);
    section = "RESULTADOS";
    emptyText = search.results ? "Nenhum resultado encontrado." : null;
  }

  let body;
  if (tab !== "search" && error) {
    body = (
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
  } else if (tab !== "search" && loading && !data) {
    body = (
      <View
        accessibilityLabel="Carregando seguidores"
        className="h-[200px] items-center justify-center"
      >
        <ActivityIndicator color={COLORS.accent} />
      </View>
    );
  } else if (list.length > 0) {
    body = (
      <>
        <Text className="mb-2.5 mt-[22px] text-[12px] font-semibold tracking-[1px] text-prisma-muted">
          {section}
        </Text>
        {list.map((person) => (
          <FollowRow key={person.profile_id} person={person} onToggle={toggle} />
        ))}
      </>
    );
  } else if (emptyText) {
    body = (
      <View className="items-center px-5 pt-10">
        <Icon name="users" size={26} color={COLORS.faint} />
        <Text className="mt-3 text-center text-[13.5px] text-prisma-faint">
          {emptyText}
        </Text>
      </View>
    );
  }

  const errorMessage = toggleError ?? (tab === "search" ? search.error : null);

  return (
    <View className="flex-1 bg-prisma-background">
      <StatusBar style="light" />
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-[120px] pt-[58px]"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="mt-1.5 flex-row gap-1 rounded-2xl border border-white/[0.07] bg-white/[0.045] p-1">
          {tabs.map((item) => {
            const active = item.id === tab;
            return (
              <Pressable
                key={item.id}
                accessibilityRole="tab"
                accessibilityLabel={
                  item.count === undefined ? item.label : `${item.label}, ${item.count}`
                }
                accessibilityState={{ selected: active }}
                onPress={() => setTab(item.id)}
                className={`h-10 flex-1 flex-row items-center justify-center gap-1.5 rounded-xl ${
                  active ? "bg-[#1f2633]" : ""
                }`}
              >
                <Text
                  className={`text-[13.5px] font-semibold ${active ? "text-prisma-ink" : "text-prisma-muted"}`}
                >
                  {item.label}
                </Text>
                {item.count !== undefined ? (
                  <Text
                    className={`text-[11.5px] opacity-70 ${active ? "text-prisma-ink" : "text-prisma-muted"}`}
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

        {body}
      </ScrollView>
    </View>
  );
}
