import { create } from "zustand";

type TState = "icon" | "table";
type TStore = {
  data: TState;
  setData: (data: TState) => void;
};

const useInitViewTypeStore = create<TStore>()((set) => ({
  data: "icon",
  setData: (data) => set({ data }),
}));

export const useViewTypeStore = () => {
  const { data, setData } = useInitViewTypeStore();

  return { data, setData, toggle: () => setData(data === "icon" ? "table" : "icon") };
};
