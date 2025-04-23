import { userSchema } from "@/modules/users/dbUsersUtils";
import PocketBase, { BaseAuthStore } from "pocketbase";
import { useEffect } from "react";
import { z } from "zod";
import { create } from "zustand";

export const pocketbaseAuthStoreSchema = z.object({
  token: z.string(),
  record: userSchema,
});

type TPocketbaseAuthStore = z.infer<typeof pocketbaseAuthStoreSchema>;
type TState = TPocketbaseAuthStore | null | undefined;

export const useAuthDataStore = create<{
  data: TState;
  setData: (x: TState) => void;
  clear: () => void;
}>()((set) => ({
  data: undefined,
  setData: (data) => set(() => ({ data })),
  clear: () => set(() => ({ data: undefined })),
}));

const extractAuthData = (authStore: BaseAuthStore) => {
  return pocketbaseAuthStoreSchema.safeParse(authStore);
};

export const useAuthDataSync = (p: { pb: PocketBase }) => {
  const authDataStore = useAuthDataStore();
  useEffect(() => {
    if (!p.pb.authStore.isValid) return authDataStore.setData(null);

    const resp = extractAuthData(p.pb.authStore);
    authDataStore.setData(resp.success ? resp.data : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    p.pb.authStore.onChange(() => {
      if (p.pb.authStore.isValid) {
        const resp = extractAuthData(p.pb.authStore);
        authDataStore.setData(resp.success ? resp.data : null);
      } else {
        authDataStore.setData(null);
      }
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
