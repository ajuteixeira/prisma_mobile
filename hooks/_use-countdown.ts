import { useCallback, useEffect, useState } from "react";

/** Contagem regressiva em segundos, usada no reenvio do código. */
export const useCountdown = (seconds: number) => {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (remaining <= 0) return;
    const timeout = setTimeout(() => setRemaining((current) => current - 1), 1000);
    return () => clearTimeout(timeout);
  }, [remaining]);

  const start = useCallback(() => setRemaining(seconds), [seconds]);
  const reset = useCallback(() => setRemaining(0), []);

  return { remaining, running: remaining > 0, start, reset };
};

/** Formata os segundos restantes como `m:ss`. */
export const formatCountdown = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};
