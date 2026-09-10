/**
 * Tokens visuais do protótipo "Prisma Mobile" (artboard 4a — recuperação de senha).
 * Os mesmos valores estão espelhados em `tailwind.config.js` sob a chave `prisma`,
 * para que o className e o style compartilhem a mesma paleta.
 */
export const COLORS = {
  /** Fundo da tela, atrás dos feixes. */
  background: "#0a0e14",
  /** Sheet arredondado que carrega o formulário. */
  surface: "#12161d",
  /** Títulos. */
  ink: "#f4f6fa",
  /** Texto digitado nos campos. */
  body: "#e5e7eb",
  /** Subtítulos e textos de apoio. */
  muted: "#9ca3af",
  /** Placeholders e estados desabilitados. */
  faint: "#6b7280",
  /** Links e ícones dos campos. */
  accent: "#60a5fa",
  /** Início do gradiente do botão primário. */
  brand: "#3b82f6",
  /** Fim do gradiente do botão primário. */
  brandDark: "#1d4ed8",
  success: "#10b981",
  danger: "#f87171",
  dangerText: "#fca5a5",
} as const;

/** Gradiente do botão primário (135deg no protótipo). */
export const BRAND_GRADIENT = [COLORS.brand, COLORS.brandDark] as const;

/**
 * Feixes de luz do topo. Cada plataforma conectada acende sua própria cor —
 * a intensidade reproduz o peso definido no protótipo.
 */
export type PrismaBeam = {
  /** Canal RGB da cor, sem alpha, para compor as camadas do brilho. */
  rgb: string;
  /** Opacidade acumulada no centro do feixe. */
  intensity: number;
  size: number;
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  /** Deslocamento da animação de flutuação. */
  drift: { x: number; y: number };
  duration: number;
  delay: number;
};

export const PRISMA_BEAMS: PrismaBeam[] = [
  {
    rgb: "0, 112, 204", // PlayStation
    intensity: 0.5,
    size: 480,
    top: -260,
    left: -160,
    drift: { x: 26, y: -18 },
    duration: 20000,
    delay: 0,
  },
  {
    rgb: "102, 192, 244", // Steam
    intensity: 0.45,
    size: 480,
    top: -200,
    right: -200,
    drift: { x: -22, y: 20 },
    duration: 25000,
    delay: 1000,
  },
  {
    rgb: "16, 124, 16", // Xbox
    intensity: 0.26,
    size: 340,
    bottom: -190,
    left: 20,
    drift: { x: 18, y: 14 },
    duration: 22000,
    delay: 3000,
  },
];

/** Véu escuro sobre os feixes, para o texto do header manter contraste. */
export const PRISMA_SCRIM = "rgba(10, 14, 20, 0.68)";

/** Altura da área de topo (feixes + título) definida no protótipo. */
export const AUTH_HERO_HEIGHT = 250;
