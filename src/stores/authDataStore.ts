import { userSchema } from "@/modules/users/dbUsersUtils";
import PocketBase from "pocketbase";
import { useEffect } from "react";
import { z } from "zod";
import { create } from "zustand";

export const pocketbaseAuthStoreSchema = z.object({
  token: z.string(),
  record: userSchema,
});

type TState = boolean | undefined;

export const useIsLoggedInStore = create<{
  data: TState;
  setData: (x: TState) => void;
  clear: () => void;
}>()((set) => ({
  data: undefined,
  setData: (data) => set(() => ({ data })),
  clear: () => set(() => ({ data: undefined })),
}));

export const useAuthDataSync = (p: { pb: PocketBase }) => {
  const isLoggedInStore = useIsLoggedInStore();
  useEffect(() => {
    if (!p.pb.authStore.isValid) return isLoggedInStore.setData(false);

    const resp = pocketbaseAuthStoreSchema.safeParse(p.pb.authStore);
    isLoggedInStore.setData(resp.success);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    p.pb.authStore.onChange(() => {
      if (!p.pb.authStore.isValid) return isLoggedInStore.setData(false);

      const resp = pocketbaseAuthStoreSchema.safeParse(p.pb.authStore);
      isLoggedInStore.setData(resp.success);
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
