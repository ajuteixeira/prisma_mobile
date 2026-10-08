import { memo, type PropsWithChildren, type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
} from "./alert-dialog";
import { GradientButton } from "./_gradient-button";
import { Icon, type IconName } from "./_icon";

const TONES = {
  warning: { color: "#fbbf24", background: "rgba(251, 191, 36, 0.14)", button: undefined },
  danger: {
    color: "#f87171",
    background: "rgba(239, 68, 68, 0.14)",
    button: ["#dc2626", "#991b1b"] as const,
  },
};

type ConfirmDialogProps = PropsWithChildren<{
  visible: boolean;
  onClose: () => void;
  tone: keyof typeof TONES;
  icon: IconName;
  title: string;
  message: ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  /** Bloqueia os dois botões e o toque fora enquanto a ação roda. */
  loading?: boolean;
  /** Bloqueia só a confirmação, ex.: até digitar a palavra exigida. */
  disabled?: boolean;
}>;

/**
 * Diálogo de confirmação centralizado. `children` entra entre a mensagem e os
 * botões, para campos extras; nesse caso o diálogo sobe junto com o teclado.
 */
export const ConfirmDialog = memo(
  ({
    visible,
    onClose,
    tone,
    icon,
    title,
    message,
    confirmLabel,
    onConfirm,
    loading = false,
    disabled = false,
    children,
  }: ConfirmDialogProps) => {
    const colors = TONES[tone];
    const close = () => {
      if (!loading) onClose();
    };

    return (
      <AlertDialog isOpen={visible} onClose={close} avoidKeyboard={Boolean(children)}>
        {/* O backdrop do gluestack para em 50% de opacidade; o escurecimento real vem da cor. */}
        <AlertDialogBackdrop
          animate={{ opacity: 1 }}
          style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
        />
        <AlertDialogContent
          className="w-[88%] max-w-[400px] rounded-[26px] border-prisma-sheet-border bg-prisma-surface p-6"
          style={{ boxShadow: "0px 24px 60px rgba(0, 0, 0, 0.6)" }}
        >
          <AlertDialogHeader className="flex-col items-start">
            <View
              className="h-14 w-14 items-center justify-center rounded-[18px]"
              style={{ backgroundColor: colors.background }}
            >
              <Icon name={icon} size={22} color={colors.color} />
            </View>
            <Text
              className="mt-[18px] text-[22px] font-bold text-white"
              style={{ letterSpacing: -0.3 }}
            >
              {title}
            </Text>
          </AlertDialogHeader>

          <AlertDialogBody className="mt-2">
            {typeof message === "string" ? (
              <Text className="text-[13.5px] leading-5 text-prisma-muted">{message}</Text>
            ) : (
              message
            )}
            {children ? <View className="mt-[18px]">{children}</View> : null}
          </AlertDialogBody>

          <AlertDialogFooter className="mt-6 gap-2.5">
            <Pressable
              accessibilityRole="button"
              onPress={close}
              disabled={loading}
              className="h-[52px] flex-1 items-center justify-center rounded-2xl border border-prisma-ghost-border bg-prisma-ghost-bg"
              style={{ opacity: loading ? 0.6 : 1 }}
            >
              <Text className="text-[15px] font-semibold text-prisma-body">Cancelar</Text>
            </Pressable>
            <View className="flex-[1.4]">
              <GradientButton
                label={confirmLabel}
                loading={loading}
                disabled={disabled}
                colors={colors.button}
                height={52}
                radius={16}
                onPress={onConfirm}
              />
            </View>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  },
);

ConfirmDialog.displayName = "ConfirmDialog";
