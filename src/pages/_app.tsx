import { Layout } from "@/components/Layout";
import { PageLoading } from "@/components/PageLoading";
import { pb } from "@/config/pocketbaseConfig";
import { AuthForm } from "@/modules/auth/AuthForm";
import { smartSubscribeToFiles } from "@/modules/files/dbFilesUtils";
import { useFilesStore } from "@/modules/files/filesStore";
import { smartSubscribeToUsers, subscribeToUser } from "@/modules/users/dbUsersUtils";
import { useUsersStore } from "@/modules/users/usersStore";
import { useCurrentUserStore } from "@/modules/users/currentUserStore";
import { useAuthDataStore, useAuthDataSync } from "@/stores/authDataStore";
import { useThemeStore } from "@/stores/themeStore";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect } from "react";

export default function App({ Component, pageProps }: AppProps) {
  const themeStore = useThemeStore();
  const authDataStore = useAuthDataStore();
  const filesStore = useFilesStore();
  const usersStore = useUsersStore();
  const currentUserStore = useCurrentUserStore();

  themeStore.useThemeStoreSideEffect();
  useAuthDataSync({ pb: pb });

  useEffect(() => {
    const isLoggedIn = !!authDataStore.data?.token;
    const id = authDataStore.data?.record.id;

    if (isLoggedIn && id) {
      smartSubscribeToFiles({ pb, onChange: (x) => filesStore.setData(x) });
      smartSubscribeToUsers({ pb, onChange: (x) => usersStore.setData(x) });
      subscribeToUser({ pb, id, onChange: (x) => currentUserStore.setData(x) });
    } else {
      filesStore.clear();
      usersStore.clear();
      currentUserStore.clear();
    }
  }, [authDataStore.data?.token]);

  const authState = (() => {
    if (currentUserStore.data === undefined) return "loading" as const;
    if (!!currentUserStore.data === null) return "loggedOut" as const;
    return "loggedIn" as const;
  })();

  return (
    <>
      <Layout showLeftSidebar={authState === "loggedIn"}>
        {authState === "loggedIn" && <Component {...pageProps} />}
        {authState === "loggedOut" && (
          <div className="flex justify-center">
            <AuthForm />
          </div>
        )}
        {authState === "loading" && <PageLoading />}
      </Layout>
    </>
  );
}
