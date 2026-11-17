import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import type { ComponentProps } from "react";

/** Cor dos blocos sobre as superfícies escuras do app. */
const BONE_COLOR = "bg-white/[0.07]";

/** Bloco de skeleton do gluestack com a cor do app. O tamanho vem do `className`. */
export const Bone = (props: ComponentProps<typeof Skeleton>) => (
  <Skeleton startColor={BONE_COLOR} {...props} />
);

/** Linhas de texto do gluestack com a cor do app. A altura de cada linha vem do `className`. */
export const BoneText = (props: ComponentProps<typeof SkeletonText>) => (
  <SkeletonText startColor={BONE_COLOR} {...props} />
);
