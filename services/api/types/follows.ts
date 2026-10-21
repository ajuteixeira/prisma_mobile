/** Pessoa nas listas de Seguidores (`/api/follows`). */
export type FollowProfile = {
  profile_id: number;
  username: string;
  /** Nome completo ou, na falta dele, o username. */
  display_name: string;
  /** Data URL do avatar enviado na web; `null` usa o avatar gerado. */
  avatar_url: string | null;
  /** Se o usuário logado segue essa pessoa. */
  is_following: boolean;
};

/** Contagens das abas Seguidores e Seguindo. */
export type FollowCounts = {
  followers_count: number;
  following_count: number;
};

/** Página de uma lista de Seguidores; `next_offset` é `null` na última. */
export type FollowPage = {
  results: FollowProfile[];
  next_offset: number | null;
};
