import { ReactNode } from "react";
import { create } from "zustand";

type TState = ReactNode | null;
type TStore = {
  data: TState;
  setData: (data: TState) => void;
};

const useInitSidebarStore = create<TStore>()((set) => ({
  data: null,
  setData: (data) => set({ data }),
}));

export const useRightSidebarStore = () => {
  const { data, setData } = useInitSidebarStore();

  return { data, setData, close: () => setData(null) };
};
