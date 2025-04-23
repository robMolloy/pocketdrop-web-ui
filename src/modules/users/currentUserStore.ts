import { create } from "zustand";
import { TUser } from "./dbUsersUtils";

type TState = TUser | undefined | null;

export const useCurrentUserStore = create<{
  data: TState;
  setData: (x: TState) => void;
  clear: () => void;
}>()((set) => ({
  data: undefined,
  setData: (data) => set(() => ({ data })),
  clear: () => set(() => ({ data: null })),
}));
