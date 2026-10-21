import FollowersScreen from "@/app/(tabs)/followers";
import { useSession } from "@/store";
import {
  act,
  fireEvent,
  mockFetchRoutes,
  renderRouter,
  screen,
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

const FOLLOWS = { followers: [ANA], following: [BETO] };

const renderScreen = () =>
  renderRouter(
    { index: () => null, "(tabs)/followers/index": FollowersScreen },
    { initialUrl: "/followers" },
  );

describe("FollowersScreen", () => {
  beforeEach(() => {
    useSession.setState({ token: "abc", user: USER });
  });

  it("abre em Seguidores com as contagens nas abas", async () => {
    mockFetchRoutes({ "GET /api/follows": [200, FOLLOWS] });
    await renderScreen();

    expect(await screen.findByText("Ana Souza")).toBeOnTheScreen();
    expect(screen.getByText("@ana")).toBeOnTheScreen();
    expect(screen.getByLabelText("Seguidores, 1")).toBeSelected();
    expect(screen.getByLabelText("Seguindo, 1")).toBeOnTheScreen();
    // Quem só segue o usuário fica na outra aba.
    expect(screen.queryByText("beto")).toBeNull();
  });

  it("troca para a aba Seguindo", async () => {
    mockFetchRoutes({ "GET /api/follows": [200, FOLLOWS] });
    await renderScreen();
    await screen.findByText("Ana Souza");

    await fireEvent.press(screen.getByLabelText("Seguindo, 1"));
    expect(await screen.findByText("@beto")).toBeOnTheScreen();
    expect(screen.queryByText("Ana Souza")).toBeNull();
  });

  it("mostra os vazios de cada aba como a web", async () => {
    mockFetchRoutes({ "GET /api/follows": [200, { followers: [], following: [] }] });
    await renderScreen();

    expect(await screen.findByText("Nenhum seguidor ainda.")).toBeOnTheScreen();
    await fireEvent.press(screen.getByLabelText("Seguindo, 0"));
    expect(screen.getByText("Você ainda não segue ninguém.")).toBeOnTheScreen();
  });

  it("seguir de volta atualiza o botão e a aba Seguindo", async () => {
    const spy = mockFetchRoutes({
      "GET /api/follows": [
        [200, FOLLOWS],
        [
          200,
          {
            followers: [{ ...ANA, is_following: true }],
            following: [{ ...ANA, is_following: true }, BETO],
          },
        ],
      ],
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
      "GET /api/follows": [
        [200, FOLLOWS],
        [200, { followers: [ANA], following: [] }],
      ],
      "DELETE /api/follows/3": [204],
    });
    await renderScreen();
    await screen.findByText("Ana Souza");
    await fireEvent.press(screen.getByLabelText("Seguindo, 1"));

    await fireEvent.press(screen.getByLabelText("Deixar de seguir beto"));
    expect(
      await screen.findByText("Você ainda não segue ninguém."),
    ).toBeOnTheScreen();
  });

  it("desfaz o botão e mostra o erro quando a API recusa", async () => {
    mockFetchRoutes({
      "GET /api/follows": [200, FOLLOWS],
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
    afterEach(() => jest.useRealTimers());

    const openSearch = async () => {
      await renderScreen();
      await screen.findByText("Ana Souza");
      await fireEvent.press(screen.getByLabelText("Pesquisar"));
    };

    const type = async (text: string) => {
      await fireEvent.changeText(screen.getByLabelText("Buscar por username"), text);
      await act(() => jest.advanceTimersByTimeAsync(300));
    };

    it("busca por username ao digitar", async () => {
      const spy = mockFetchRoutes({
        "GET /api/follows": [200, FOLLOWS],
        "GET /api/follows/search": [200, { results: [CAIO] }],
      });
      await openSearch();

      await type("cai");
      expect(await screen.findByText("@caio")).toBeOnTheScreen();
      const searchUrl = spy.mock.calls
        .map(([url]) => new URL(String(url)))
        .find((url) => url.pathname === "/api/follows/search");
      expect(searchUrl?.searchParams.get("q")).toBe("cai");
    });

    it("sem texto não busca nem mostra nada", async () => {
      const spy = mockFetchRoutes({ "GET /api/follows": [200, FOLLOWS] });
      await openSearch();

      await type("   ");
      expect(screen.queryByText("Nenhum resultado encontrado.")).toBeNull();
      expect(
        spy.mock.calls.some(([url]) => String(url).includes("/search")),
      ).toBe(false);
    });

    it("avisa quando ninguém é encontrado", async () => {
      mockFetchRoutes({
        "GET /api/follows": [200, FOLLOWS],
        "GET /api/follows/search": [200, { results: [] }],
      });
      await openSearch();

      await type("zzz");
      expect(
        await screen.findByText("Nenhum resultado encontrado."),
      ).toBeOnTheScreen();
    });
  });

  it("mostra o erro e tenta de novo", async () => {
    mockFetchRoutes({
      "GET /api/follows": [
        [500, { error: "Falhou" }],
        [200, FOLLOWS],
      ],
    });
    await renderScreen();

    expect(
      await screen.findByText("Não foi possível carregar seus seguidores."),
    ).toBeOnTheScreen();
    await fireEvent.press(screen.getByText("Tentar novamente"));
    expect(await screen.findByText("Ana Souza")).toBeOnTheScreen();
  });
});
