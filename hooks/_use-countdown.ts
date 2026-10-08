import { useCallback, useEffect, useState } from "react";

/** Contagem regressiva em segundos. Com `startNow`, começa contando `seconds` na montagem. */
export const useCountdown = (seconds: number, startNow = false) => {
  const [remaining, setRemaining] = useState(startNow ? seconds : 0);

  useEffect(() => {
    if (remaining <= 0) return;
    const timeout = setTimeout(() => setRemaining((current) => current - 1), 1000);
    return () => clearTimeout(timeout);
  }, [remaining]);

  /** `override` vale para esta contagem, ex.: o prazo que a API acabou de devolver. */
  const start = useCallback(
    (override?: number) => setRemaining(override ?? seconds),
    [seconds],
  );
  const reset = useCallback(() => setRemaining(0), []);

  return { remaining, running: remaining > 0, start, reset };
};
