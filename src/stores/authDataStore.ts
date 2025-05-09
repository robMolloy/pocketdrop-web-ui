import { TUser, userSchema } from "@/modules/users/dbUsersUtils";
import PocketBase from "pocketbase";
import { useEffect } from "react";
import { z } from "zod";
import { create } from "zustand";

const pocketbaseAuthStoreSchema = z.object({
  token: z.string(),
  record: userSchema,
});
type TAuth = z.infer<typeof pocketbaseAuthStoreSchema>;

type TState = { status: "loading" | "loggedOut" } | { status: "loggedIn"; auth: TAuth };

export const useUnverifiedIsLoggedInStore = create<{
  data: TState;
  setData: (x: TState) => void;
}>()((set) => ({
  data: { status: "loading" },
  setData: (data) => set(() => ({ data })),
}));

export const useAuthDataSync = (p: { pb: PocketBase }) => {
  const isLoggedInStore = useUnverifiedIsLoggedInStore();
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
  }, []);
};

// export const useCurrentUserStore = () => {
//   const unverifiedIsLoggedInStore = useUnverifiedIsLoggedInStore();
//   return {
//     data: (() => {
//       if (unverifiedIsLoggedInStore.data.status === "loading") return undefined;
//       if (unverifiedIsLoggedInStore.data.status === "loggedIn")
//         return unverifiedIsLoggedInStore.data.auth.record;
//       return null;
//     })(),
//   };
// };

type TNewCurrentUserState =
  | { status: "loading" | "loggedOut" }
  | { status: "loggedIn"; user: TUser };

export const useNewCurrentUserStore = create<{
  data: TNewCurrentUserState;
  setData: (x: TNewCurrentUserState) => void;
}>()((set) => ({
  data: { status: "loading" },
  setData: (data) => set(() => ({ data })),
}));
