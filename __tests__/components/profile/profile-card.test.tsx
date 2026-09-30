import { ProfileCard } from "@/components/profile";
import type { ProfileCardData } from "@/services";
import { fireEvent, render, screen, within } from "@/__tests__/utils";

const achievement = (id: number, name: string, icon_url: string | null = null) => ({
  id,
  name,
  game_name: "Jogo",
  icon_url,
  position: id,
});

const CARLY: ProfileCardData = {
  id: 7,
  username: "carly",
  bio: "Caçadora de platina desde o PS2. Speedrun nas horas vagas, 100% sempre que dá. Bora comparar conquistas?",
  avatar_url: null,
  followers_count: 89,
  following_count: 23,
  pinned_achievements: [
    achievement(1, "Mestre Atirador", "https://cdn.test/mestre.png"),
    achievement(2, "Fantasma"),
    achievement(3, "Velocidade da Luz"),
    achievement(4, "Perfeição"),
  ],
};

const renderCard = (profile: ProfileCardData = CARLY, handlers = {}) =>
  render(
    <ProfileCard
      profile={profile}
      onShare={jest.fn()}
      onPressFollowers={jest.fn()}
      onPressFollowing={jest.fn()}
      {...handlers}
    />,
  );

describe("ProfileCard", () => {
  it("mostra @username, contadores e bio", async () => {
    await renderCard();

    expect(screen.getByText("@carly")).toBeOnTheScreen();
    expect(within(screen.getByLabelText("89 seguidores")).getByText("89")).toBeOnTheScreen();
    expect(within(screen.getByLabelText("23 seguindo")).getByText("23")).toBeOnTheScreen();
    expect(screen.getByText(CARLY.bio!)).toBeOnTheScreen();
  });

  it("lista as conquistas fixadas na ordem da API", async () => {
    await renderCard();

    expect(screen.getByText("CONQUISTAS FIXADAS")).toBeOnTheScreen();
    const names = screen.getAllByTestId("pinned-achievement").map((tile) =>
      within(tile).getByTestId("pinned-achievement-name").props.children,
    );
    expect(names).toEqual(["Mestre Atirador", "Fantasma", "Velocidade da Luz", "Perfeição"]);
  });

  it("usa a imagem da conquista quando existe e um troféu quando não", async () => {
    await renderCard();

    const [withIcon, withoutIcon] = screen.getAllByTestId("pinned-achievement");
    expect(within(withIcon).getByTestId("pinned-achievement-image")).toBeOnTheScreen();
    expect(within(withoutIcon).queryByTestId("pinned-achievement-image")).not.toBeOnTheScreen();
  });

  it("volta para o troféu se a imagem da conquista não carregar", async () => {
    await renderCard();

    const [withIcon] = screen.getAllByTestId("pinned-achievement");
    await fireEvent(within(withIcon).getByTestId("pinned-achievement-image"), "error", {
      nativeEvent: { error: "404" },
    });

    expect(within(withIcon).queryByTestId("pinned-achievement-image")).not.toBeOnTheScreen();
  });

  it("sem conquistas fixadas, mostra um convite no lugar da grade", async () => {
    await renderCard({ ...CARLY, pinned_achievements: [] });

    expect(screen.queryAllByTestId("pinned-achievement")).toHaveLength(0);
    expect(screen.getByText("Nenhuma conquista fixada ainda.")).toBeOnTheScreen();
  });

  it("sem bio, não renderiza o parágrafo", async () => {
    await renderCard({ ...CARLY, bio: null });

    expect(screen.queryByTestId("profile-bio")).not.toBeOnTheScreen();
  });

  it("repassa os toques em compartilhar, seguidores e seguindo", async () => {
    const onShare = jest.fn();
    const onPressFollowers = jest.fn();
    const onPressFollowing = jest.fn();
    await renderCard(CARLY, { onShare, onPressFollowers, onPressFollowing });

    await fireEvent.press(screen.getByLabelText("Compartilhar perfil"));
    await fireEvent.press(screen.getByLabelText("89 seguidores"));
    await fireEvent.press(screen.getByLabelText("23 seguindo"));

    expect(onShare).toHaveBeenCalledTimes(1);
    expect(onPressFollowers).toHaveBeenCalledTimes(1);
    expect(onPressFollowing).toHaveBeenCalledTimes(1);
  });
});
