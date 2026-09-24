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
  /** Texto e ícones sobre as superfícies azuis translúcidas. */
  accentSoft: "#93c5fd",
  /** Início do gradiente do botão primário. */
  brand: "#3b82f6",
  /** Fim do gradiente do botão primário. */
  brandDark: "#1d4ed8",
  success: "#10b981",
  danger: "#f87171",
  dangerText: "#fca5a5",
  /** Trilho neutro das barras de progresso e réguas. */
  track: "rgba(255, 255, 255, 0.12)",
} as const;

/** Gradiente do botão primário (135deg no protótipo). */
export const BRAND_GRADIENT = [COLORS.brand, COLORS.brandDark] as const;

/**
 * Feixes de luz do topo. Cada plataforma conectada acende sua própria cor —
 * a intensidade reproduz o peso definido no protótipo.
 */
export type PrismaBeam = {
  /** Identificador estável do feixe (usado como key na lista). */
  id: string;
  /** Canal RGB da cor, sem alpha, para compor as camadas do brilho. */
  rgb: string;
  /** Opacidade acumulada no centro do feixe. */
  intensity: number;
  size: number;
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  /** Opacidade do feixe inteiro — apaga quando a plataforma não está vinculada. */
  opacity?: number;
  /** Deslocamento da animação de flutuação. */
  drift: { x: number; y: number };
  duration: number;
  delay: number;
};

export const PRISMA_BEAMS: PrismaBeam[] = [
  {
    id: "playstation",
    rgb: "0, 112, 204",
    intensity: 0.5,
    size: 480,
    top: -260,
    left: -160,
    drift: { x: 26, y: -18 },
    duration: 20000,
    delay: 0,
  },
  {
    id: "steam",
    rgb: "102, 192, 244",
    intensity: 0.45,
    size: 480,
    top: -200,
    right: -200,
    drift: { x: -22, y: 20 },
    duration: 25000,
    delay: 1000,
  },
  {
    id: "xbox",
    rgb: "16, 124, 16",
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

/**
 * Topo do login (artboard 2a): mais alto que o dos fluxos, porque carrega o
 * logotipo. Os 330px do protótipo incluem os 54px da barra de status.
 */
export const LOGIN_HERO_HEIGHT = 276;

/** O login acende as quatro plataformas, com os pesos do protótipo 2a. */
export const LOGIN_BEAMS: PrismaBeam[] = [
  {
    id: "playstation",
    rgb: "0, 112, 204",
    intensity: 0.55,
    size: 520,
    top: -240,
    left: -180,
    drift: { x: 26, y: -18 },
    duration: 20000,
    delay: 0,
  },
  {
    id: "steam",
    rgb: "102, 192, 244",
    intensity: 0.5,
    size: 520,
    top: -160,
    right: -220,
    drift: { x: -22, y: 20 },
    duration: 25000,
    delay: 1000,
  },
  {
    id: "xbox",
    rgb: "16, 124, 16",
    intensity: 0.35,
    size: 420,
    bottom: -220,
    left: -40,
    drift: { x: 18, y: 14 },
    duration: 18000,
    delay: 2000,
  },
  {
    id: "retroachievements",
    rgb: "212, 160, 23",
    intensity: 0.32,
    size: 360,
    bottom: -180,
    right: -80,
    drift: { x: -16, y: 16 },
    duration: 22000,
    delay: 3000,
  },
];

/**
 * Cores do logotipo PRISMA, uma por letra. O protótipo pinta a palavra com um
 * gradiente (#0070CC → #66c0f4 → #107C10 → #D4A017); sem máscara de texto no
 * React Native, cada letra recebe a cor do gradiente na sua posição.
 */
export const PRISMA_LOGO_COLORS = [
  "#0070cc",
  "#4aa6e8",
  "#5aae9a",
  "#15801a",
  "#6e8e14",
  "#d4a017",
] as const;

/**
 * Régua de força da senha (artboard 3a): o índice é a pontuação de 0 a 4 —
 * um ponto por critério atendido (6+ caracteres, 10+, maiúscula, número/símbolo).
 */
export const PASSWORD_STRENGTH_COLORS = [
  COLORS.track,
  "#ef4444",
  "#d4a017",
  "#66c0f4",
  COLORS.success,
] as const;

export const PASSWORD_STRENGTH_LABELS = ["", "Fraca", "Média", "Boa", "Forte"] as const;

/** Altura da área de topo da tela de vinculação (artboard 5a). */
export const CONNECT_HERO_HEIGHT = 236;

/** O véu de 5a é um pouco mais leve: os quatro feixes precisam aparecer. */
export const CONNECT_SCRIM = "rgba(10, 14, 20, 0.66)";

/**
 * Um feixe por plataforma. Na tela de vinculação cada um acende conforme a
 * conta correspondente é conectada — daí o `id` casar com o slug da API.
 */
export const CONNECT_BEAMS: PrismaBeam[] = [
  {
    id: "playstation",
    rgb: "0, 112, 204",
    intensity: 0.45,
    size: 460,
    top: -250,
    left: -150,
    drift: { x: 26, y: -18 },
    duration: 20000,
    delay: 0,
  },
  {
    id: "steam",
    rgb: "102, 192, 244",
    intensity: 0.45,
    size: 460,
    top: -200,
    right: -190,
    drift: { x: -22, y: 20 },
    duration: 25000,
    delay: 1000,
  },
  {
    id: "xbox",
    rgb: "16, 124, 16",
    intensity: 0.4,
    size: 330,
    bottom: -180,
    left: 10,
    drift: { x: 18, y: 14 },
    duration: 22000,
    delay: 3000,
  },
  {
    id: "retroachievements",
    rgb: "212, 160, 23",
    intensity: 0.4,
    size: 330,
    bottom: -170,
    right: -40,
    drift: { x: -16, y: 16 },
    duration: 24000,
    delay: 2000,
  },
];

/** Opacidade do feixe de uma plataforma ainda não vinculada. */
export const BEAM_OFF_OPACITY = 0.12;
