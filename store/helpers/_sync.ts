import { syncApi, type SyncStatus } from "@/services";
import { create } from "zustand";
import { useSession } from "./_session";

type SyncStore = {
  /** Último estado devolvido pela API. `null` antes da primeira consulta. */
  status: SyncStatus | null;
  /** Passa a `true` quando uma sincronização roda e volta a `false` em `dismissSync`. */
  visible: boolean;
  minimized: boolean;
  /** Incrementa a cada conta concluída e ao fim da sincronização. */
  revision: number;
};

const INITIAL: SyncStore = {
  status: null,
  visible: false,
  minimized: false,
  revision: 0,
};

/** Intervalo entre consultas enquanto a sincronização roda. */
const POLL_INTERVAL_MS = 2000;
/** Intervalo entre consultas após uma falha de rede. */
const RETRY_INTERVAL_MS = 5000;

/** Estado da sincronização de jogos e conquistas do usuário logado. */
const useSync = create<SyncStore>()(() => INITIAL);

let timer: ReturnType<typeof setTimeout> | null = null;
/** Incrementa em `resetSync`. Respostas de consultas iniciadas antes são descartadas. */
let generation = 0;

const stopPolling = () => {
  if (timer) clearTimeout(timer);
  timer = null;
};

const apply = (next: SyncStatus) =>
  useSync.setState((state) => {
    const previous = state.status;
    const progressed =
      previous !== null &&
      (next.accounts_done > previous.accounts_done || (previous.running && !next.running));

    return {
      status: next,
      visible: state.visible || next.running,
      revision: progressed ? state.revision + 1 : state.revision,
    };
  });

/**
 * Consulta o estado após `delay` ms e repete enquanto `running` for `true`. Em
 * falha de rede, repete após `RETRY_INTERVAL_MS` se o último estado indicava
 * sincronização em andamento.
 */
const schedule = (token: string, delay: number) => {
  stopPolling();
  const current = generation;
  timer = setTimeout(async () => {
    timer = null;
    try {
      const status = await syncApi.status(token);
      if (current !== generation) return;
      apply(status);
      if (status.running) schedule(token, POLL_INTERVAL_MS);
    } catch {
      if (current === generation && useSync.getState().status?.running) {
        schedule(token, RETRY_INTERVAL_MS);
      }
    }
  }, delay);
};

/**
 * Pede ao servidor a sincronização das contas pendentes e consulta o progresso
 * enquanto ela roda. Sem sessão, não faz nada. Falhas da API são ignoradas.
 */
const startSync = async () => {
  const token = useSession.getState().token;
  if (!token) return;
  const current = generation;
  const result = await syncApi.start(token).catch(() => null);
  if (!result || current !== generation) return;
  apply(result.sync);
  if (result.sync.running) schedule(token, POLL_INTERVAL_MS);
};

const minimizeSync = () => useSync.setState({ minimized: true });
const restoreSync = () => useSync.setState({ minimized: false });
const dismissSync = () => useSync.setState({ visible: false, minimized: false });

/** Para as consultas e volta ao estado inicial. Executada sempre que o token da sessão muda. */
const resetSync = () => {
  generation += 1;
  stopPolling();
  useSync.setState(INITIAL);
};

useSession.subscribe((state, previous) => {
  if (state.token !== previous.token) resetSync();
});

export { dismissSync, minimizeSync, resetSync, restoreSync, startSync, useSync };
export type { SyncStore };
