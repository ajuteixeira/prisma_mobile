import { ApiError, authApi } from "@/services";
import { useSession } from "@/store";
import { useEffect } from "react";
import { AppState } from "react-native";

export const useAuth = () => {
  const token = useSession((state) => state.token);
  const signOut = useSession((state) => state.signOut);

  useEffect(() => {
    if (!token) return;

    const check = () =>
      authApi.me(token).catch((error) => {
        if (error instanceof ApiError && error.status === 401) signOut();
      });

    check();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") check();
    });
    return () => subscription.remove();
  }, [signOut, token]);

  return { token, authenticated: Boolean(token) };
};
