import { SyncBanner } from "@/components/sync";
import type { SyncStatus } from "@/services";
import { resetSync, useSync } from "@/store";
import { fireEvent, render, screen } from "@/__tests__/utils";

const status = (overrides: Partial<SyncStatus> = {}): SyncStatus => ({
  running: true,
  started_at: null,
  finished_at: null,
  accounts_total: 2,
  accounts_done: 1,
  accounts_failed: 0,
  games_synced: 40,
  achievements_synced: 1200,
  current: { platform: "playstation", games_done: 25, games_total: 50 },
  platforms: [],
  ...overrides,
});

const show = (value: SyncStatus) =>
  useSync.setState({ status: value, visible: true, minimized: false });

describe("SyncBanner", () => {
  beforeEach(() => resetSync());

  it("não aparece sem sincronização", async () => {
    await render(<SyncBanner />);
    expect(screen.queryByText("Sincronizando suas contas")).toBeNull();
  });

  it("mostra a conta atual e o progresso geral", async () => {
    show(status());
    await render(<SyncBanner />);

    expect(screen.getByText("Sincronizando suas contas")).toBeOnTheScreen();
    expect(screen.getByText("PlayStation · 25 de 50 jogos")).toBeOnTheScreen();
    expect(screen.getByText("75%")).toBeOnTheScreen();
  });

  it("avisa enquanto a plataforma ainda lista os jogos", async () => {
    show(
      status({
        current: { platform: "steam", games_done: 0, games_total: null },
      }),
    );
    await render(<SyncBanner />);

    expect(screen.getByText("Steam · buscando jogos…")).toBeOnTheScreen();
  });

  it("minimiza numa pill com o percentual e volta ao tocar", async () => {
    show(status());
    await render(<SyncBanner />);

    await fireEvent.press(screen.getByLabelText("Minimizar sincronização"));
    expect(screen.queryByText("Sincronizando suas contas")).toBeNull();

    await fireEvent.press(screen.getByLabelText("Mostrar sincronização, 75%"));
    expect(screen.getByText("Sincronizando suas contas")).toBeOnTheScreen();
  });

  it("mostra o resumo ao concluir e fecha", async () => {
    show(status({ running: false, current: null, accounts_done: 2 }));
    await render(<SyncBanner />);

    expect(screen.getByText("Sincronização concluída")).toBeOnTheScreen();
    expect(screen.getByText("40 jogos e 1.200 conquistas sincronizados.")).toBeOnTheScreen();

    await fireEvent.press(screen.getByLabelText("Fechar aviso de sincronização"));
    expect(screen.queryByText("Sincronização concluída")).toBeNull();
  });

  it("aponta as plataformas que falharam", async () => {
    show(
      status({
        running: false,
        current: null,
        platforms: [
          { platform: "steam", sync_status: "completed" },
          { platform: "xbox", sync_status: "failed" },
        ],
      }),
    );
    await render(<SyncBanner />);

    expect(screen.getByText("Sincronização interrompida")).toBeOnTheScreen();
    expect(
      screen.getByText("Não foi possível sincronizar Xbox Live. Tente novamente mais tarde."),
    ).toBeOnTheScreen();
  });
});
