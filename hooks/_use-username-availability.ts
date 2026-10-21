import { usernameSchema } from "@/schemas";
import { authApi } from "@/services";
import { useEffect, useState } from "react";

const DEBOUNCE = 400;

/** Situação do nickname digitado. */
export type UsernameStatus = "idle" | "checking" | "available" | "taken" | "invalid";

/** Confere na API, após uma pausa na digitação, se `username` está livre. O `current` é sempre livre. */
export const useUsernameAvailability = (username: string, current: string) => {
  const [answer, setAnswer] = useState<{ username: string; status: UsernameStatus } | null>(null);
  const unchanged = username === current;
  const valid = usernameSchema.safeParse(username).success;

  useEffect(() => {
    if (unchanged || !valid) return;
    let active = true;
    const timer = setTimeout(async () => {
      try {
        const result = await authApi.availability({ username });
        if (active) setAnswer({ username, status: result.username === false ? "taken" : "available" });
      } catch {
        // Sem resposta, o servidor confere de novo ao salvar.
        if (active) setAnswer({ username, status: "idle" });
      }
    }, DEBOUNCE);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [username, unchanged, valid]);

  if (unchanged) return "idle";
  if (!valid) return "invalid";
  return answer?.username === username ? answer.status : "checking";
};
