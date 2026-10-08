/** Segundos como `m:ss`. */
export const formatCountdown = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

/** 2847 → "2.847", como no protótipo. */
export const formatCount = (value: number) =>
  String(Math.trunc(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

/** Tempo de jogo: "845 h" a partir de 1 hora, senão "45 min". */
export const formatPlaytime = (minutes: number) =>
  minutes < 60 ? `${Math.trunc(minutes)} min` : `${formatCount(minutes / 60)} h`;

const MONTHS = [
  "jan.",
  "fev.",
  "mar.",
  "abr.",
  "mai.",
  "jun.",
  "jul.",
  "ago.",
  "set.",
  "out.",
  "nov.",
  "dez.",
];

/** "28 de out." no ano corrente, "28 de out. de 2025" nos anteriores; `null` se a data for inválida. */
export const formatPlayedDate = (iso: string, now = new Date()) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const dayMonth = `${date.getDate()} de ${MONTHS[date.getMonth()]}`;
  return date.getFullYear() === now.getFullYear()
    ? dayMonth
    : `${dayMonth} de ${date.getFullYear()}`;
};

/** % de conquistas desbloqueadas, truncada para só chegar a 100 com o jogo completo. */
export const completionPercent = (unlocked: number, total: number) =>
  total > 0 ? Math.floor((unlocked / total) * 100) : 0;
