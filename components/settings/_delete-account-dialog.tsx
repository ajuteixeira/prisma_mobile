import { ConfirmDialog, TextField } from "@/components/ui";
import { useState } from "react";
import { Alert, Text } from "react-native";

const CONFIRM_WORD = "EXCLUIR";

type DeleteAccountDialogProps = { visible: boolean; onClose: () => void };

/** Exclusão de conta, liberada só depois de digitar EXCLUIR. */
export const DeleteAccountDialog = ({ visible, onClose }: DeleteAccountDialogProps) => {
  const [confirmText, setConfirmText] = useState("");

  const close = () => {
    setConfirmText("");
    onClose();
  };

  const confirm = () => {
    // TODO(api): POST /api/auth/delete (ou equivalente) ainda não existe.
    close();
    Alert.alert("Em breve", "A exclusão de conta ainda não está disponível.");
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
      confirmLabel="Excluir conta"
      disabled={confirmText !== CONFIRM_WORD}
      onConfirm={confirm}
    >
      <TextField
        icon="key"
        placeholder={CONFIRM_WORD}
        value={confirmText}
        onChangeText={(value) => setConfirmText(value.toUpperCase())}
        autoCapitalize="characters"
        autoCorrect={false}
      />
    </ConfirmDialog>
  );
};
