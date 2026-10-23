import { GameView } from "@/components/game";
import { useSession } from "@/store";
import { Redirect, useLocalSearchParams } from "expo-router";

/**
 * Tela de um jogo do perfil (artboard 8a), aberta pela lista "Jogos" e pelo
 * destaque. Com `?username=`, de um jogo do perfil de outra pessoa.
 */
export default function GameScreen() {
  const token = useSession((state) => state.token);
  const { id, username } = useLocalSearchParams<{ id: string; username?: string }>();
  const gameId = Number(id);

  if (!token) return <Redirect href="/login" />;
  if (!Number.isInteger(gameId) || gameId <= 0) return <Redirect href="/profile" />;

  return <GameView key={`${username ?? ""}:${gameId}`} id={gameId} username={username} />;
}
