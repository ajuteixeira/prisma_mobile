import SettingsScreen from "@/app/(tabs)/settings";
import { useSession } from "@/store";
import {
  act,
  fetchBodyOf,
  fireEvent,
  mockFetchRoutes,
  renderRouter,
  screen,
  waitFor,
} from "@/__tests__/utils";
import * as ImagePicker from "expo-image-picker";

jest.mock("expo-image-picker", () => ({ launchImageLibraryAsync: jest.fn() }));

const pickImage = ImagePicker.launchImageLibraryAsync as jest.Mock;

const USER = { id: 1, email: "carly@prisma.gg", username: "carly", full_name: "Carly Mendes" };

const PROFILE = {
  id: 7,
  username: "carly",
  bio: "Caçadora de platina.",
  avatar_url: null,
  followers_count: 89,
  following_count: 23,
  pinned_achievements: [],
};

const saved = (changes: Record<string, unknown>) =>
  [
    200,
    {
      profile: { ...PROFILE, ...changes },
      user: { ...USER, ...changes },
    },
  ] as [number, unknown];

const renderScreen = () =>
  renderRouter(
    { index: () => null, "(tabs)/settings/index": SettingsScreen, "(tabs)/profile": () => null },
    { initialUrl: "/settings" },
  );

const openSheet = async () => {
  await renderScreen();
  await fireEvent.press(screen.getByLabelText("Editar perfil"));
  return screen.findByDisplayValue("Caçadora de platina.");
};

describe("Ajustes — Editar perfil", () => {
  beforeEach(() => {
    useSession.setState({ token: "abc", user: USER });
    pickImage.mockReset();
  });

  it("abre a sheet preenchida com nome, nickname e bio", async () => {
    mockFetchRoutes({ "GET /api/profile": [200, { profile: PROFILE }] });
    await openSheet();

    expect(screen.getByText("Editar perfil")).toBeOnTheScreen();
    expect(screen.getByDisplayValue("Carly Mendes")).toBeOnTheScreen();
    expect(screen.getByDisplayValue("carly")).toBeOnTheScreen();
    expect(screen.getByText("20/90")).toBeOnTheScreen();
  });

  it("salva só o que mudou, atualiza a sessão e fecha a sheet", async () => {
    const fetch = mockFetchRoutes({
      "GET /api/profile": [200, { profile: PROFILE }],
      "PATCH /api/profile": saved({ full_name: "Carly M." }),
    });
    await openSheet();

    await fireEvent.changeText(screen.getByDisplayValue("Carly Mendes"), "Carly M.");
    await fireEvent.press(screen.getByLabelText("Salvar alterações"));

    await waitFor(() => expect(useSession.getState().user?.full_name).toBe("Carly M."));
    expect(fetchBodyOf(fetch, "PATCH", "/api/profile")).toEqual({ full_name: "Carly M." });
    expect(useSession.getState().token).toBe("abc");
    await waitFor(() => expect(screen.queryByText("Editar perfil")).not.toBeOnTheScreen());
  });

  it("confere o nickname novo na API e mostra disponível ou em uso", async () => {
    mockFetchRoutes({
      "GET /api/profile": [200, { profile: PROFILE }],
      "POST /api/auth/availability": [
        [200, { username: false }],
        [200, { username: true }],
      ],
    });
    await openSheet();

    await fireEvent.changeText(screen.getByDisplayValue("carly"), "Ana");
    expect(screen.getByDisplayValue("ana")).toBeOnTheScreen();
    expect(await screen.findByText("em uso")).toBeOnTheScreen();

    await fireEvent.changeText(screen.getByDisplayValue("ana"), "ana_2");
    expect(await screen.findByText("disponível")).toBeOnTheScreen();
  });

  it("não salva com nome curto ou nickname inválido", async () => {
    const fetch = mockFetchRoutes({ "GET /api/profile": [200, { profile: PROFILE }] });
    await openSheet();

    await fireEvent.changeText(screen.getByDisplayValue("Carly Mendes"), "Ca");
    await fireEvent.press(screen.getByLabelText("Salvar alterações"));

    expect(fetchBodyOf(fetch, "PATCH", "/api/profile")).toBeUndefined();
  });

  it("corta a bio no limite de 90 caracteres", async () => {
    mockFetchRoutes({ "GET /api/profile": [200, { profile: PROFILE }] });
    await openSheet();

    await fireEvent.changeText(screen.getByDisplayValue(PROFILE.bio), "a".repeat(120));

    expect(screen.getByDisplayValue("a".repeat(90))).toBeOnTheScreen();
    expect(screen.getByText("90/90")).toBeOnTheScreen();
  });

  it("mostra o erro de campo devolvido pela API", async () => {
    mockFetchRoutes({
      "GET /api/profile": [200, { profile: PROFILE }],
      "PATCH /api/profile": [422, { errors: { bio: ["deve ter no maximo 90 caracteres"] } }],
    });
    await openSheet();

    await fireEvent.changeText(screen.getByDisplayValue(PROFILE.bio), "Outra bio");
    await fireEvent.press(screen.getByLabelText("Salvar alterações"));

    expect(await screen.findByText("deve ter no maximo 90 caracteres")).toBeOnTheScreen();
    expect(screen.getByText("Editar perfil")).toBeOnTheScreen();
  });

  it("envia a foto escolhida como data URL", async () => {
    pickImage.mockResolvedValue({
      canceled: false,
      assets: [{ uri: "file:///foto.jpg", base64: "Zm90bw==", mimeType: "image/jpeg" }],
    });
    const fetch = mockFetchRoutes({
      "GET /api/profile": [200, { profile: PROFILE }],
      "PATCH /api/profile": saved({ avatar_url: "data:image/jpeg;base64,Zm90bw==" }),
    });
    await openSheet();

    await fireEvent.press(screen.getByText("Alterar foto"));
    await act(async () => undefined);
    await fireEvent.press(screen.getByLabelText("Salvar alterações"));

    await waitFor(() =>
      expect(fetchBodyOf(fetch, "PATCH", "/api/profile")).toEqual({
        avatar: "data:image/jpeg;base64,Zm90bw==",
      }),
    );
  });

  it("recusa foto acima de 2 MB", async () => {
    pickImage.mockResolvedValue({
      canceled: false,
      assets: [{ uri: "file:///grande.png", base64: "a".repeat(2_800_000), mimeType: "image/png" }],
    });
    mockFetchRoutes({ "GET /api/profile": [200, { profile: PROFILE }] });
    await openSheet();

    await fireEvent.press(screen.getByText("Alterar foto"));

    expect(await screen.findByText("A foto deve ter no máximo 2 MB.")).toBeOnTheScreen();
  });

  it("cancelar fecha sem salvar", async () => {
    const fetch = mockFetchRoutes({ "GET /api/profile": [200, { profile: PROFILE }] });
    await openSheet();

    await fireEvent.press(screen.getByText("Cancelar"));

    await waitFor(() => expect(screen.queryByText("Editar perfil")).not.toBeOnTheScreen());
    expect(fetchBodyOf(fetch, "PATCH", "/api/profile")).toBeUndefined();
  });
});
