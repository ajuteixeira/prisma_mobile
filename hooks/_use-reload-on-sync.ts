import { useSync } from "@/store";
import { useEffect, useRef } from "react";

/** Chama `reload` a cada incremento de `revision` em `useSync`. Não chama na montagem. */
export const useReloadOnSync = (reload: () => void) => {
  const revision = useSync((state) => state.revision);
  const handled = useRef(revision);

  useEffect(() => {
    if (revision === handled.current) return;
    handled.current = revision;
    reload();
  }, [revision, reload]);
};
