import { dismissSync, resetSync, startSync, useSession, useSync } from "@/store";
import { mockFetchRoutes } from "@/__tests__/utils";

const USER = {
  id: 1,
  email: "carly@prisma.gg",
  username: "carly",
  full_name: "Carly Mendes",
};

const status = (overrides: Record<string, unknown> = {}) => ({
  running: true,
  started_at: "2026-10-20T12:00:00Z",
  finished_at: null,
  accounts_total: 1,
  accounts_done: 0,
  accounts_failed: 0,
  games_synced: 0,
  achievements_synced: 0,
  current: { platform: "steam", games_done: 3, games_total: 10 },
  platforms: [{ platform: "steam", sync_status: "running" }],
  ...overrides,
});

const FINISHED = status({
  running: false,
  accounts_done: 1,
  games_synced: 10,
  achievements_synced: 120,
  current: null,
  platforms: [{ platform: "steam", sync_status: "completed" }],
});

/** Avança o intervalo do polling e espera a resposta ser aplicada. */
const nextPoll = () => jest.advanceTimersByTimeAsync(2000);

describe("useSync", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    useSession.setState({ token: "abc", user: USER });
    resetSync();
  });

  afterEach(() => {
    resetSync();
    jest.useRealTimers();
  });

  it("inicia, acompanha o progresso e avisa as telas quando termina", async () => {
    const fetch = mockFetchRoutes({
      "POST /api/sync": [202, { started: true, sync: status() }],
      "GET /api/sync": [
        [
          200,
          {
            sync: status({
              current: { platform: "steam", games_done: 7, games_total: 10 },
            }),
          },
        ],
        [200, { sync: FINISHED }],
      ],
    });

    await startSync();
    expect(useSync.getState()).toMatchObject({ visible: true, revision: 0 });

    await nextPoll();
    expect(useSync.getState().status?.current).toEqual({
      platform: "steam",
      games_done: 7,
      games_total: 10,
    });

    await nextPoll();
    expect(useSync.getState()).toMatchObject({
      status: { running: false },
      revision: 1,
    });

    // Terminou: não consulta mais.
    await nextPoll();
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it("sem nada pendente, não mostra o banner nem consulta de novo", async () => {
    const fetch = mockFetchRoutes({
      "POST /api/sync": [200, { started: false, sync: FINISHED }],
    });

    await startSync();
    await nextPoll();

    expect(useSync.getState().visible).toBe(false);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("ignora a falha ao iniciar", async () => {
    mockFetchRoutes({ "POST /api/sync": [500, { error: "boom" }] });

    await expect(startSync()).resolves.toBeUndefined();
    expect(useSync.getState().status).toBeNull();
  });

  it("para de acompanhar ao sair da conta", async () => {
    const fetch = mockFetchRoutes({
      "POST /api/sync": [202, { started: true, sync: status() }],
      "GET /api/sync": [200, { sync: status() }],
    });

    await startSync();
    useSession.setState({ token: null, user: null });
    await nextPoll();

    expect(useSync.getState()).toMatchObject({ status: null, visible: false });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("fechar esconde o banner", async () => {
    mockFetchRoutes({
      "POST /api/sync": [202, { started: true, sync: status() }],
      "GET /api/sync": [200, { sync: FINISHED }],
    });

    await startSync();
    await nextPoll();
    dismissSync();

    expect(useSync.getState().visible).toBe(false);
  });
});
