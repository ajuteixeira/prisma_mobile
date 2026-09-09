import { memo, type PropsWithChildren } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Sheet arredondado onde vive o formulário. Ele nunca troca de tela: os passos
 * do fluxo se alternam aqui dentro, preservando o contexto do usuário.
 */
export const AuthSheet = memo(({ children }: PropsWithChildren) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 rounded-t-[34px] border-t border-prisma-sheet-border bg-prisma-surface px-6 pt-[22px]"
      style={{
        paddingBottom: Math.max(insets.bottom, 24) + 22,
        boxShadow: "0px -24px 60px rgba(0, 0, 0, 0.6)",
      }}
    >
      {children}
    </View>
  );
});

AuthSheet.displayName = "AuthSheet";
