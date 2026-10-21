import FollowersScreen from "@/app/(tabs)/followers";
import { useSession } from "@/store";
import {
  act,
  cleanup,
  fireEvent,
  mockFetchRoutes,
  renderRouter,
  screen,
  waitFor,
} from "@/__tests__/utils";

const USER = {
  id: 1,
  email: "carly@prisma.gg",
  username: "carly",
  full_name: null,
};

const person = (overrides: object) => ({
  avatar_url: null,
  is_following: false,
  ...overrides,
});

const ANA = person({ profile_id: 2, username: "ana", display_name: "Ana Souza" });
const BETO = person({
  profile_id: 3,
  username: "beto",
  display_name: "beto",
  is_following: true,
});
const CAIO = person({ profile_id: 4, username: "caio", display_name: "caio" });

const page = (results: object[], next_offset: number | null = null): [number, object] => [
  200,
  { results, next_offset },
];
const COUNTS: [number, object] = [200, { followers_count: 1, following_count: 1 }];
const ROUTES = {
  "GET /api/follows": COUNTS,
  "GET /api/follows/followers": page([ANA]),
  "GET /api/follows/following": page([BETO]),
};

const renderScreen = () =>
  renderRouter(
    { index: () => null, "(tabs)/followers/index": FollowersScreen },
    { initialUrl: "/followers" },
  );

const urlsOf = (spy: jest.SpyInstance, path: string) =>
  spy.mock.calls
    .map(([url]) => new URL(String(url)))
    .filter((url) => url.pathname === path);

describe("FollowersScreen", () => {
  beforeEach(() => {
    useSession.setState({ token: "abc", user: USER });
  });

  it("abre em Seguidores com as contagens nas abas", async () => {
    mockFetchRoutes(ROUTES);
    await renderScreen();

    expect(await screen.findByText("Ana Souza")).toBeOnTheScreen();
    expect(screen.getByText("@ana")).toBeOnTheScreen();
    expect(screen.getByLabelText("Seguidores, 1")).toBeSelected();
    expect(screen.getByLabelText("Seguindo, 1")).toBeOnTheScreen();
    // Quem só segue o usuário fica na outra aba.
    expect(screen.queryByText("beto")).toBeNull();
  });

  it("troca para a aba Seguindo", async () => {
    mockFetchRoutes(ROUTES);
    await renderScreen();
    await screen.findByText("Ana Souza");

    await fireEvent.press(screen.getByLabelText("Seguindo, 1"));
    expect(await screen.findByText("@beto")).toBeOnTheScreen();
    expect(screen.queryByText("Ana Souza")).toBeNull();
  });

  it("carrega a próxima página ao chegar no fim da lista", async () => {
    const spy = mockFetchRoutes({
      ...ROUTES,
      "GET /api/follows/followers": [page([ANA], 20), page([CAIO])],
    });
    await renderScreen();
    await screen.findByText("Ana Souza");

    await fireEvent(screen.getByTestId("follow-list"), "endReached");
    expect(await screen.findByText("@caio")).toBeOnTheScreen();
    expect(screen.getByText("Ana Souza")).toBeOnTheScreen();
    expect(
      urlsOf(spy, "/api/follows/followers").map((url) => url.searchParams.get("offset")),
    ).toEqual(["0", "20"]);

    // Sem próxima página, chegar no fim não busca de novo.
    await fireEvent(screen.getByTestId("follow-list"), "endReached");
    expect(urlsOf(spy, "/api/follows/followers")).toHaveLength(2);
  });

  it("mostra os vazios de cada aba como a web", async () => {
    mockFetchRoutes({
      "GET /api/follows": [200, { followers_count: 0, following_count: 0 }],
      "GET /api/follows/followers": page([]),
      "GET /api/follows/following": page([]),
    });
    await renderScreen();

    expect(await screen.findByText("Nenhum seguidor ainda.")).toBeOnTheScreen();
    await fireEvent.press(screen.getByLabelText("Seguindo, 0"));
    expect(
      await screen.findByText("Você ainda não segue ninguém."),
    ).toBeOnTheScreen();
  });

  it("seguir de volta atualiza o botão e a contagem de Seguindo", async () => {
    const spy = mockFetchRoutes({
      ...ROUTES,
      "GET /api/follows": [COUNTS, [200, { followers_count: 1, following_count: 2 }]],
      "PUT /api/follows/2": [204],
    });
    await renderScreen();
    await screen.findByText("Ana Souza");

    await fireEvent.press(screen.getByLabelText("Seguir Ana Souza"));

    expect(
      await screen.findByLabelText("Deixar de seguir Ana Souza"),
    ).toBeOnTheScreen();
    expect(await screen.findByLabelText("Seguindo, 2")).toBeOnTheScreen();
    expect(
      spy.mock.calls.some(
        ([url, init]) => String(url).endsWith("/api/follows/2") && init?.method === "PUT",
      ),
    ).toBe(true);
  });

  it("deixar de seguir na aba Seguindo tira a pessoa da lista", async () => {
    mockFetchRoutes({
      ...ROUTES,
      "GET /api/follows": [COUNTS, [200, { followers_count: 1, following_count: 0 }]],
      "DELETE /api/follows/3": [204],
    });
    await renderScreen();
    await screen.findByText("Ana Souza");
    await fireEvent.press(screen.getByLabelText("Seguindo, 1"));

    await fireEvent.press(await screen.findByLabelText("Deixar de seguir beto"));
    expect(
      await screen.findByText("Você ainda não segue ninguém."),
    ).toBeOnTheScreen();
  });

  it("desfaz o botão e mostra o erro quando a API recusa", async () => {
    mockFetchRoutes({
      ...ROUTES,
      "PUT /api/follows/2": [422, { error: "Nao foi possivel atualizar o follow agora." }],
    });
    await renderScreen();
    await screen.findByText("Ana Souza");

    await fireEvent.press(screen.getByLabelText("Seguir Ana Souza"));
    expect(
      await screen.findByText("Nao foi possivel atualizar o follow agora."),
    ).toBeOnTheScreen();
    expect(screen.getByLabelText("Seguir Ana Souza")).toBeOnTheScreen();
  });

  describe("Pesquisar", () => {
    beforeEach(() => jest.useFakeTimers());
    // Desmonta ainda com o relógio falso: com os timers reais de volta, o
    // `cleanup` do RNTL espera timers falsos que nunca disparam e os testes
    // seguintes estouram o tempo.
    afterEach(async () => {
      await cleanup();
      jest.useRealTimers();
    });

    const openSearch = async () => {
      await renderScreen();
      await screen.findByText("Ana Souza");
      await fireEvent.press(screen.getByLabelText("Pesquisar"));
    };

    const type = async (text: string) => {
      await fireEvent.changeText(screen.getByLabelText("Buscar por username"), text);
      await act(() => jest.advanceTimersByTimeAsync(300));
    };

    it("lista todo mundo sem texto e filtra por username ao digitar", async () => {
      const spy = mockFetchRoutes({
        ...ROUTES,
        "GET /api/follows/search": [page([ANA, BETO, CAIO]), page([CAIO])],
      });
      await openSearch();

      expect(await screen.findByText("@beto")).toBeOnTheScreen();
      expect(screen.getByText("@caio")).toBeOnTheScreen();

      await type("cai");
      await waitFor(() => expect(screen.queryByText("@beto")).toBeNull());
      expect(screen.getByText("@caio")).toBeOnTheScreen();
      expect(
        urlsOf(spy, "/api/follows/search").map((url) => url.searchParams.get("q")),
      ).toEqual(["", "cai"]);
    });

    it("avisa quando ninguém é encontrado", async () => {
      mockFetchRoutes({
        ...ROUTES,
        "GET /api/follows/search": [page([ANA]), page([])],
      });
      await openSearch();
      await screen.findByText("@ana");

      await type("zzz");
      expect(
        await screen.findByText("Nenhum resultado encontrado."),
      ).toBeOnTheScreen();
    });
  });

  it("mostra o erro e tenta de novo", async () => {
    mockFetchRoutes({
      ...ROUTES,
      "GET /api/follows/followers": [[500, { error: "Falhou" }], page([ANA])],
    });
    await renderScreen();

    expect(
      await screen.findByText("Não foi possível carregar seus seguidores."),
    ).toBeOnTheScreen();
    await fireEvent.press(screen.getByText("Tentar novamente"));
    expect(await screen.findByText("Ana Souza")).toBeOnTheScreen();
  });
});
