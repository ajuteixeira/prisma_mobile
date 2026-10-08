import { StatusBar } from "expo-status-bar";
import type { PropsWithChildren, ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { AuthSheet } from "./_auth-sheet";

type AuthScreenProps = PropsWithChildren<{
  header: ReactNode;
  /** Respiro entre o topo do sheet e o conteúdo. */
  contentTop?: number;
}>;

/** Esqueleto das telas de autenticação: topo, sheet rolável e fuga do teclado no iOS. */
export const AuthScreen = ({ header, contentTop = 26, children }: AuthScreenProps) => (
  <View className="flex-1 bg-prisma-background">
    <StatusBar style="light" />

    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {header}

      <AuthSheet>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, paddingTop: contentTop }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </AuthSheet>
    </KeyboardAvoidingView>
  </View>
);

/** Ocupa o espaço livre, empurrando o que vem depois para a base do sheet. */
export const AuthSpacer = () => <View className="flex-1" />;
