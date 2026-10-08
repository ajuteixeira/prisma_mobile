import { RecentGamesList, RecentlyPlayedCard, RecentlyPlayedEmpty } from "@/components/profile";
import type { RecentGame } from "@/services";
import { fireEvent, render, screen } from "@/__tests__/utils";

const game = (overrides: Partial<RecentGame> = {}): RecentGame => ({
  id: 1,
  name: "Counter-Strike: Global Offensive",
  cover_url: "https://cdn.test/730.jpg",
  platform: { slug: "steam", name: "Steam" },
  playtime_minutes: 50700,
  last_played_at: new Date(2025, 9, 28, 12).toISOString(),
  unlocked_achievements: 142,
  total_achievements: 167,
  ...overrides,
});

describe("RecentlyPlayedCard", () => {
  it("mostra capa, plataforma, horas, data e progresso das conquistas", async () => {
    await render(<RecentlyPlayedCard game={game()} />);

    expect(screen.getByText("Counter-Strike: Global Offensive")).toBeOnTheScreen();
    expect(screen.getByText("Steam")).toBeOnTheScreen();
    expect(screen.getByText("845 h registradas · jogado em 28 de out. de 2025")).toBeOnTheScreen();
    expect(screen.getByText("142 de 167 · 85%")).toBeOnTheScreen();
    expect(screen.getByTestId("recent-game-cover")).toBeOnTheScreen();
    expect(screen.getByTestId("recent-game-progress")).toHaveStyle({
      width: "85%",
    });
  });

  it("sem capa, mostra o ícone no lugar da imagem", async () => {
    await render(<RecentlyPlayedCard game={game({ cover_url: null })} />);

    expect(screen.queryByTestId("recent-game-cover")).not.toBeOnTheScreen();
    expect(screen.getByTestId("recent-game-cover-fallback")).toBeOnTheScreen();
  });

  it("omite horas e data quando a API não as informa", async () => {
    await render(
      <RecentlyPlayedCard game={game({ playtime_minutes: null, last_played_at: null })} />,
    );

    expect(screen.queryByText(/registradas|jogado em/)).not.toBeOnTheScreen();
  });

  it("avisa quando o jogo não tem conquistas", async () => {
    await render(
      <RecentlyPlayedCard game={game({ unlocked_achievements: 0, total_achievements: 0 })} />,
    );

    expect(screen.getByText("Este jogo não tem conquistas")).toBeOnTheScreen();
    expect(screen.queryByTestId("recent-game-progress")).not.toBeOnTheScreen();
  });

  it("usa o nome enviado pela API para plataformas que o app não conhece", async () => {
    await render(<RecentlyPlayedCard game={game({ platform: { slug: "epic", name: "Epic" } })} />);

    expect(screen.getByText("Epic")).toBeOnTheScreen();
  });
});

describe("RecentGamesList", () => {
  it("mostra cada jogo com porcentagem e resumo, como no protótipo", async () => {
    await render(
      <RecentGamesList
        games={[
          game({
            id: 2,
            name: "Valorant",
            playtime_minutes: 14040,
            unlocked_achievements: 31,
            total_achievements: 50,
          }),
          game({
            id: 3,
            name: "Phasmophobia",
            playtime_minutes: 33711,
            unlocked_achievements: 54,
            total_achievements: 54,
          }),
        ]}
      />,
    );

    expect(screen.getAllByTestId("recent-game-row")).toHaveLength(2);
    expect(screen.getByText("Valorant")).toBeOnTheScreen();
    expect(screen.getByText("62%")).toBeOnTheScreen();
    expect(screen.getByText("31/50 conquistas · 234 h · Steam")).toBeOnTheScreen();
    expect(screen.getByText("100%")).toBeOnTheScreen();
  });

  it("resume jogos sem conquistas sem mostrar 0/0", async () => {
    await render(
      <RecentGamesList
        games={[
          game({
            name: "Roblox",
            unlocked_achievements: 0,
            total_achievements: 0,
            playtime_minutes: 0,
          }),
        ]}
      />,
    );

    expect(screen.getByText("Sem conquistas · 0 min · Steam")).toBeOnTheScreen();
  });
});

describe("RecentlyPlayedEmpty", () => {
  it("convida a vincular uma plataforma", async () => {
    const onConnect = jest.fn();
    await render(<RecentlyPlayedEmpty onConnect={onConnect} />);

    expect(screen.getByText("Nenhum jogo por aqui ainda")).toBeOnTheScreen();

    await fireEvent.press(screen.getByText("Conectar plataformas"));

    expect(onConnect).toHaveBeenCalled();
  });
});
