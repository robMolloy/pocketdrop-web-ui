import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  storeVersionHistory: boolean;
  encryptFiles: boolean;
  setStoreVersionHistory: (value: boolean) => void;
  setEncryptFiles: (value: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      storeVersionHistory: true,
      encryptFiles: false,
      setStoreVersionHistory: (value) => set({ storeVersionHistory: value }),
      setEncryptFiles: (value) => set({ encryptFiles: value }),
    }),
    {
      name: "settings-storage",
    },
  ),
);
