import { create } from "zustand";

type LoadingStore = {
  loading: number;
  startLoading: () => void;
  stopLoading: () => void;
};

const useLoading = create<LoadingStore>()((set) => ({
  loading: 0,
  startLoading: () => set((state) => ({ loading: state.loading + 1 })),
  stopLoading: () =>
    set((state) => ({ loading: state.loading > 0 ? state.loading - 1 : 0 })),
}));

export { useLoading };
export type { LoadingStore };
