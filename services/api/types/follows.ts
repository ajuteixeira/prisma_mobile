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

export type Follows = {
  /** Quem segue o usuário, mais recentes primeiro. */
  followers: FollowProfile[];
  /** Quem o usuário segue, mais recentes primeiro. */
  following: FollowProfile[];
};
