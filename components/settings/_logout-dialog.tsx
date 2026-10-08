import { Callout, ConfirmDialog } from "@/components/ui";
import { useLogout } from "@/hooks/_use-logout";

type LogoutDialogProps = { visible: boolean; onClose: () => void };

/** Confirmação de "Sair da conta"; a falha aparece no próprio diálogo. */
export const LogoutDialog = ({ visible, onClose }: LogoutDialogProps) => {
  const { logout, loading, error, clearError } = useLogout();

  return (
    <ConfirmDialog
      visible={visible}
      onClose={() => {
        clearError();
        onClose();
      }}
      tone="warning"
      icon="signOut"
      title="Sair da conta?"
      message="Sua sessão será encerrada em todos os dispositivos. Você precisará entrar novamente."
      confirmLabel={loading ? "Saindo…" : "Sair"}
      loading={loading}
      onConfirm={logout}
    >
      {error ? <Callout tone="danger">{error}</Callout> : null}
    </ConfirmDialog>
  );
};
