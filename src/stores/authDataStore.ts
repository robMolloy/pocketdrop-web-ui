import { userSchema } from "@/modules/users/dbUsersUtils";
import PocketBase from "pocketbase";
import { useEffect } from "react";
import { z } from "zod";
import { create } from "zustand";

export const pocketbaseAuthStoreSchema = z.object({
  token: z.string(),
  record: userSchema,
});
type TAuth = z.infer<typeof pocketbaseAuthStoreSchema>;

type TState = { status: "loading" | "loggedOut" } | { status: "loggedIn"; auth: TAuth };

export const useIsLoggedInStore = create<{
  data: TState;
  setData: (x: TState) => void;
}>()((set) => ({
  data: { status: "loading" },
  setData: (data) => set(() => ({ data })),
}));

export const useAuthDataSync = (p: { pb: PocketBase }) => {
  const isLoggedInStore = useIsLoggedInStore();
  useEffect(() => {
    if (!p.pb.authStore.isValid) return isLoggedInStore.setData({ status: "loggedOut" });

    const resp = pocketbaseAuthStoreSchema.safeParse(p.pb.authStore);
    isLoggedInStore.setData(
      resp.success ? { status: "loggedIn", auth: resp.data } : { status: "loggedOut" },
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    p.pb.authStore.onChange(() => {
      if (!p.pb.authStore.isValid) return isLoggedInStore.setData({ status: "loggedOut" });

      const resp = pocketbaseAuthStoreSchema.safeParse(p.pb.authStore);
      isLoggedInStore.setData(
        resp.success ? { status: "loggedIn", auth: resp.data } : { status: "loggedOut" },
      );
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

export const useCurrentUserStore = () => {
  const isLoggedInStore = useIsLoggedInStore();
  return {
    data: (() => {
      if (isLoggedInStore.data.status === "loading") return undefined;
      if (isLoggedInStore.data.status === "loggedIn") return isLoggedInStore.data.auth.record;
      return null;
    })(),
  };
};
