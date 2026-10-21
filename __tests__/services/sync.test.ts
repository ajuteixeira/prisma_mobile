import { ApiError, syncApi } from "@/services";
import { mockFetch } from "@/__tests__/utils";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const SYNC = {
  running: true,
  started_at: "2026-10-20T12:00:00Z",
  finished_at: null,
  accounts_total: 2,
  accounts_done: 1,
  accounts_failed: 0,
  games_synced: 40,
  achievements_synced: 900,
  current: { platform: "playstation", games_done: 12, games_total: 50 },
  platforms: [
    { platform: "steam", sync_status: "completed" },
    { platform: "playstation", sync_status: "running" },
  ],
};

describe("syncApi.status", () => {
  it("envia GET /api/sync com o Bearer e devolve o estado", async () => {
    const fetch = mockFetch(200, { sync: SYNC });

    await expect(syncApi.status("meu-token")).resolves.toEqual(SYNC);

    const [url, init] = fetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${API_URL}/api/sync`);
    expect(init.method).toBe("GET");
    expect(init.headers).toMatchObject({ Authorization: "Bearer meu-token" });
  });

  it("tolera campos ausentes ou com tipo inesperado", async () => {
    mockFetch(200, {
      sync: { running: "sim", current: { games_done: 3 }, platforms: [{}] },
    });

    await expect(syncApi.status("token")).resolves.toEqual({
      running: false,
      started_at: null,
      finished_at: null,
      accounts_total: 0,
      accounts_done: 0,
      accounts_failed: 0,
      games_synced: 0,
      achievements_synced: 0,
      current: null,
      platforms: [],
    });
  });
});

describe("syncApi.start", () => {
  it("envia POST /api/sync e indica se a sincronização começou", async () => {
    const fetch = mockFetch(202, { started: true, sync: SYNC });

    await expect(syncApi.start("meu-token")).resolves.toEqual({
      started: true,
      sync: SYNC,
    });

    const [url, init] = fetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${API_URL}/api/sync`);
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({ Authorization: "Bearer meu-token" });
  });

  it("lança ApiError quando a API recusa", async () => {
    mockFetch(404, { error: "Perfil nao encontrado" });

    await expect(syncApi.start("token")).rejects.toBeInstanceOf(ApiError);
  });
});
