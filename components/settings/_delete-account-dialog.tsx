import { Callout, ConfirmDialog, TextField } from "@/components/ui";
import { useDeleteAccount } from "@/hooks/_use-delete-account";
import { useState } from "react";
import { Text } from "react-native";

const CONFIRM_WORD = "EXCLUIR";

type DeleteAccountDialogProps = { visible: boolean; onClose: () => void };

/** Exclusão definitiva da conta, liberada só depois de digitar EXCLUIR; a falha aparece no próprio diálogo. */
export const DeleteAccountDialog = ({ visible, onClose }: DeleteAccountDialogProps) => {
  const [confirmText, setConfirmText] = useState("");
  const { deleteAccount, loading, error, clearError } = useDeleteAccount();

  const close = () => {
    setConfirmText("");
    clearError();
    onClose();
  };

  return (
    <ConfirmDialog
      visible={visible}
      onClose={close}
      tone="danger"
      icon="alert"
      title="Excluir sua conta?"
      message={
        <Text className="text-[13.5px] leading-5 text-prisma-muted">
          Todos os seus dados, conquistas e progresso serão apagados para sempre. Digite{" "}
          <Text className="font-bold text-prisma-danger-text">{CONFIRM_WORD}</Text> para confirmar.
        </Text>
      }
      confirmLabel={loading ? "Excluindo…" : "Excluir conta"}
      loading={loading}
      disabled={confirmText !== CONFIRM_WORD}
      onConfirm={deleteAccount}
    >
      <TextField
        icon="key"
        placeholder={CONFIRM_WORD}
        value={confirmText}
        onChangeText={(value) => setConfirmText(value.toUpperCase())}
        autoCapitalize="characters"
        autoCorrect={false}
      />
      {error ? <Callout tone="danger">{error}</Callout> : null}
    </ConfirmDialog>
  );
};
