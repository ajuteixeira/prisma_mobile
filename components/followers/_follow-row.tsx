import { SpectrumAvatar } from "@/components/ui";
import { usePressed } from "@/hooks/_use-pressed";
import type { FollowProfile } from "@/services";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";

type FollowRowProps = {
  person: FollowProfile;
  onToggle: (person: FollowProfile) => void;
  /** Toque no avatar ou no nome. */
  onOpen: (person: FollowProfile) => void;
};

/** Linha de Seguidores: avatar, nome, @username e o botão Seguir/Seguindo. */
export const FollowRow = memo(({ person, onToggle, onOpen }: FollowRowProps) => {
  const following = person.is_following;
  const { pressed, handlers } = usePressed();

  return (
    <View className="flex-row items-center gap-[13px] border-b border-white/[0.05] py-2.5">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ver perfil de ${person.display_name}`}
        onPress={() => onOpen(person)}
        {...handlers}
        className="min-w-0 flex-1 flex-row items-center gap-[13px]"
        style={{ opacity: pressed ? 0.6 : 1 }}
      >
        <SpectrumAvatar username={person.username} uri={person.avatar_url} size={48} />
        <View className="min-w-0 flex-1">
          <Text numberOfLines={1} className="text-[15px] font-bold text-prisma-ink">
            {person.display_name}
          </Text>
          <Text numberOfLines={1} className="mt-0.5 text-[12.5px] text-prisma-muted">
            @{person.username}
          </Text>
        </View>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${following ? "Deixar de seguir" : "Seguir"} ${person.display_name}`}
        onPress={() => onToggle(person)}
        className={`h-9 min-w-[96px] items-center justify-center rounded-xl border px-3.5 ${
          following ? "border-white/[0.16]" : "border-blue-500/60 bg-blue-600"
        }`}
      >
        <Text
          className={`text-[13px] font-semibold ${following ? "text-slate-300" : "text-white"}`}
        >
          {following ? "Seguindo" : "Seguir"}
        </Text>
      </Pressable>
    </View>
  );
});

FollowRow.displayName = "FollowRow";
