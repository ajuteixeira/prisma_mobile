import { PlatformDistributionCard, ProfileStatsCard } from "@/components/profile";
import type { PlatformShare, ProfileStats } from "@/services";
import { render, screen, within } from "@/__tests__/utils";

const STATS: ProfileStats = { total_achievements: 2847, avg_completion: 34.8, perfect_games: 8 };

const share = (slug: string, percentage: number, unlocked = 0): PlatformShare => ({
  platform_id: slug.length,
  name: slug,
  slug,
  unlocked,
  percentage,
});

/** Mesma ordem em que `GET /api/profile/stats` devolve: por id da plataforma. */
const DISTRIBUTION = [
  share("playstation", 20.0),
  share("xbox", 10.0),
  share("steam", 60.0),
  share("retroachievements", 10.0),
];

const legend = () =>
  screen.getAllByTestId("platform-share").map((item) => item.props.accessibilityLabel);

describe("ProfileStatsCard", () => {
  it("mostra conquistas, média de conclusão e jogos perfeitos", async () => {
    await render(<ProfileStatsCard stats={STATS} />);

    expect(within(screen.getByLabelText("2.847 conquistas")).getByText("2.847")).toBeOnTheScreen();
    expect(screen.getByText("Conquistas")).toBeOnTheScreen();
    expect(screen.getByText("Média conclusão")).toBeOnTheScreen();
    expect(screen.getByText("Jogos perfeitos")).toBeOnTheScreen();
    expect(screen.getByText("8")).toBeOnTheScreen();
  });

  it("trunca a média de conclusão como a web (34,8 vira 34%)", async () => {
    await render(<ProfileStatsCard stats={STATS} />);

    expect(screen.getByText("34%")).toBeOnTheScreen();
  });

  it("perfil novo mostra zeros", async () => {
    await render(
      <ProfileStatsCard stats={{ total_achievements: 0, avg_completion: 0, perfect_games: 0 }} />,
    );

    expect(screen.getAllByText("0")).toHaveLength(2);
    expect(screen.getByText("0%")).toBeOnTheScreen();
  });
});

describe("PlatformDistributionCard", () => {
  it("lista as quatro plataformas na ordem do protótipo, com a % da API", async () => {
    await render(<PlatformDistributionCard distribution={DISTRIBUTION} />);

    expect(screen.getByText("TROFÉUS POR PLATAFORMA")).toBeOnTheScreen();
    expect(legend()).toEqual([
      "Steam: 60%",
      "PlayStation: 20%",
      "Xbox Live: 10%",
      "RetroAchievements: 10%",
    ]);
  });

  it("mostra casas decimais só quando existem, no formato brasileiro", async () => {
    await render(
      <PlatformDistributionCard
        distribution={[share("steam", 66.7), share("playstation", 33.3), share("xbox", 0)]}
      />,
    );

    expect(legend()).toEqual([
      "Steam: 66,7%",
      "PlayStation: 33,3%",
      "Xbox Live: 0%",
      "RetroAchievements: 0%",
    ]);
  });

  it("plataforma ausente na resposta aparece com 0% e slug desconhecido é ignorado", async () => {
    await render(
      <PlatformDistributionCard distribution={[share("steam", 100), share("epic", 50)]} />,
    );

    expect(legend()).toEqual([
      "Steam: 100%",
      "PlayStation: 0%",
      "Xbox Live: 0%",
      "RetroAchievements: 0%",
    ]);
  });

  it("a barra só tem segmentos das plataformas com troféus, na largura da %", async () => {
    await render(
      <PlatformDistributionCard distribution={[share("steam", 75), share("xbox", 25)]} />,
    );

    const segments = screen.getAllByTestId("platform-share-segment");
    expect(segments.map((segment) => segment.props.style)).toEqual([
      expect.objectContaining({ flexGrow: 75 }),
      expect.objectContaining({ flexGrow: 25 }),
    ]);
  });

  it("sem troféus, a barra fica vazia", async () => {
    await render(<PlatformDistributionCard distribution={[]} />);

    expect(screen.queryAllByTestId("platform-share-segment")).toHaveLength(0);
    expect(legend()).toHaveLength(4);
  });
});
