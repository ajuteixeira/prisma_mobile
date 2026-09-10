import type { IconName } from "@/components/ui/_icon";

/** Slugs conforme o backend (`priv/repo/seeds.exs` / `DELETE /api/platforms/:slug`). */
export type PlatformSlug = "steam" | "playstation" | "xbox" | "retroachievements";

/**
 * Como a plataforma é vinculada:
 * - `oauth`: o provedor cuida do login, o app só abre o navegador.
 * - `credentials`: o usuário informa chave/token em um formulário antes.
 */
export type PlatformAuthKind = "oauth" | "credentials";

export type PlatformField = {
  label: string;
  placeholder: string;
};

/**
 * Passo numerado do formulário de credenciais. O primeiro passo aparece acima
 * do código de verificação; os demais, entre o código e os campos.
 */
export type PlatformInstruction = {
  title: string;
  body: string;
  /** Página oficial que o passo manda abrir. */
  link?: { label: string; url: string };
};

export type Platform = {
  slug: PlatformSlug;
  name: string;
  /** Descrição exibida enquanto a conta não está vinculada. */
  idle: string;
  icon: IconName;
  color: string;
  /** Fundo do quadrado do ícone. */
  tint: string;
  authKind: PlatformAuthKind;
  /** Texto do card enquanto a autenticação acontece. */
  loading: string;
  instructions?: PlatformInstruction[];
  /** Código que o usuário precisa colar no perfil da plataforma para provar posse. */
  verificationCode?: string;
  fields?: PlatformField[];
  /** Campo cujo valor vira o identificador exibido no card depois de vincular. */
  handleField?: number;
};

/**
 * Catálogo do artboard 5a. `expo-symbols` não expõe as marcas Steam/PlayStation/
 * Xbox, então cada plataforma recebe um símbolo genérico distinto — a cor e o
 * nome ao lado fazem a identificação.
 */
export const PLATFORMS: Platform[] = [
  {
    slug: "steam",
    name: "Steam",
    idle: "Vincule sua biblioteca Steam",
    icon: "gamepad",
    color: "#66c0f4",
    tint: "rgba(102, 192, 244, 0.14)",
    authKind: "credentials",
    loading: "Vinculando conta…",
    instructions: [
      {
        title: "1) Gere sua Steam Web API Key",
        body: "Faça login com sua conta Steam, informe um domínio (pode usar localhost), aceite os termos e copie a chave gerada.",
        link: {
          label: "Abrir steamcommunity.com/dev/apikey",
          url: "https://steamcommunity.com/dev/apikey",
        },
      },
      {
        title: "2) Cole a chave abaixo",
        body: "Vamos redirecionar você ao Steam para confirmar que a conta é sua (login via OpenID). Sua chave fica só no seu perfil e é usada para sincronizar jogos e conquistas.",
      },
    ],
    fields: [{ label: "Steam Web API Key", placeholder: "Sua chave de API da Steam" }],
  },
  {
    slug: "playstation",
    name: "PlayStation",
    idle: "Conecte sua conta PSN",
    icon: "joystick",
    color: "#4a9eea",
    tint: "rgba(0, 112, 204, 0.18)",
    authKind: "credentials",
    loading: "Vinculando conta…",
    instructions: [
      {
        title: "1) Confirme que esta conta é sua",
        body: 'Cole o código abaixo em qualquer ponto do campo "Sobre Mim" do seu perfil PlayStation antes de vincular. Não precisa apagar o texto existente. Pode levar alguns segundos para refletir.',
      },
      {
        title: "2) Insira suas credenciais",
        body: "PSN ID e Token de Acesso (NPSSO). Obtenha o NPSSO enquanto estiver conectado na sua conta PlayStation.",
        link: {
          label: "Abrir ca.account.sony.com/api/v1/ssocookie",
          url: "https://ca.account.sony.com/api/v1/ssocookie",
        },
      },
    ],
    // TODO(api): o código de posse é emitido pelo backend por vínculo.
    verificationCode: "PRISMA-Z37U",
    fields: [
      { label: "PSN ID", placeholder: "seu_username_psn" },
      { label: "Token de Acesso", placeholder: "Seu token de acesso da PSN" },
    ],
    handleField: 0,
  },
  {
    slug: "xbox",
    name: "Xbox Live",
    idle: "Login com OAuth Microsoft",
    icon: "console",
    color: "#4caf50",
    tint: "rgba(16, 124, 16, 0.2)",
    authKind: "oauth",
    loading: "Entrando via OAuth…",
  },
  {
    slug: "retroachievements",
    name: "RetroAchievements",
    idle: "Conquistas retrô",
    icon: "trophy",
    color: "#d4a017",
    tint: "rgba(212, 160, 23, 0.16)",
    authKind: "credentials",
    loading: "Vinculando conta…",
    instructions: [
      {
        title: "1) Confirme que esta conta é sua",
        body: 'Cole o código abaixo em qualquer ponto do campo "Motto" do seu perfil RetroAchievements antes de vincular. Pode mantê-lo junto do seu texto atual.',
        link: {
          label: "Abrir configurações do RetroAchievements",
          url: "https://retroachievements.org/settings",
        },
      },
      {
        title: "2) Insira suas credenciais",
        body: "Nome de usuário e Web API Key, disponíveis no menu de configurações do RetroAchievements.",
      },
    ],
    // TODO(api): o código de posse é emitido pelo backend por vínculo.
    verificationCode: "PRISMA-4Y82",
    fields: [
      { label: "Username", placeholder: "Seu usuário do RetroAchievements" },
      { label: "API Key", placeholder: "Sua chave de API" },
    ],
    handleField: 0,
  },
];
