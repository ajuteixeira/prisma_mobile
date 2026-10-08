import { completionPercent, formatCount, formatPlayedDate, formatPlaytime } from "@/utils";

describe("formatCount", () => {
  it("separa milhares com ponto, como no protótipo", () => {
    expect(formatCount(2847)).toBe("2.847");
    expect(formatCount(1234567)).toBe("1.234.567");
    expect(formatCount(8)).toBe("8");
  });
});

describe("formatPlaytime", () => {
  it("mostra horas inteiras a partir de 1 hora", () => {
    expect(formatPlaytime(50700)).toBe("845 h");
    expect(formatPlaytime(98517)).toBe("1.641 h");
    expect(formatPlaytime(60)).toBe("1 h");
  });

  it("mostra minutos abaixo de 1 hora", () => {
    expect(formatPlaytime(45)).toBe("45 min");
    expect(formatPlaytime(0)).toBe("0 min");
  });
});

describe("formatPlayedDate", () => {
  const NOW = new Date(2026, 9, 8, 12);

  it("mostra dia e mês abreviado no ano corrente", () => {
    expect(formatPlayedDate(new Date(2026, 4, 3, 12).toISOString(), NOW)).toBe("3 de mai.");
  });

  it("inclui o ano quando não é o corrente", () => {
    expect(formatPlayedDate(new Date(2025, 9, 28, 12).toISOString(), NOW)).toBe(
      "28 de out. de 2025",
    );
  });

  it("devolve null para data inválida", () => {
    expect(formatPlayedDate("ontem", NOW)).toBeNull();
  });
});

describe("completionPercent", () => {
  it("trunca a porcentagem, sem chegar a 100% antes de completar", () => {
    expect(completionPercent(142, 167)).toBe(85);
    expect(completionPercent(999, 1000)).toBe(99);
    expect(completionPercent(54, 54)).toBe(100);
  });

  it("é 0 quando o jogo não tem conquistas", () => {
    expect(completionPercent(0, 0)).toBe(0);
  });
});
