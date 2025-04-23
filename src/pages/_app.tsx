import { Layout } from "@/components/Layout";
import { PageLoading } from "@/components/PageLoading";
import { pb } from "@/config/pocketbaseConfig";
import { AuthForm } from "@/modules/auth/AuthForm";
import { smartSubscribeToFiles } from "@/modules/files/dbFilesUtils";
import { useFilesStore } from "@/modules/files/filesStore";
import { smartSubscribeToUsers, subscribeToUser } from "@/modules/users/dbUsersUtils";
import { useUsersStore } from "@/modules/users/usersStore";
import { useCurrentUserStore } from "@/modules/users/currentUserStore";
import { useIsLoggedInStore, useAuthDataSync } from "@/stores/authDataStore";
import { useThemeStore } from "@/stores/themeStore";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect } from "react";

export default function App({ Component, pageProps }: AppProps) {
  const themeStore = useThemeStore();
  const isLoggedInStore = useIsLoggedInStore();
  const filesStore = useFilesStore();
  const usersStore = useUsersStore();
  const currentUserStore = useCurrentUserStore();

  themeStore.useThemeStoreSideEffect();
  useAuthDataSync({ pb: pb });

  useEffect(() => {
    if (isLoggedInStore.data.status === "loggedIn") {
      smartSubscribeToFiles({ pb, onChange: (x) => filesStore.setData(x) });
      smartSubscribeToUsers({ pb, onChange: (x) => usersStore.setData(x) });
      subscribeToUser({
        pb,
        id: isLoggedInStore.data.auth.record.id,
        onChange: (x) => currentUserStore.setData(x),
      });
    } else {
      filesStore.clear();
      usersStore.clear();
      currentUserStore.clear();
    }
  }, [isLoggedInStore.data]);

  return (
    <>
      <Layout showLeftSidebar={isLoggedInStore.data.status === "loggedIn"}>
        {isLoggedInStore.data.status === "loggedIn" && <Component {...pageProps} />}
        {isLoggedInStore.data.status === "loggedOut" && (
          <div className="flex justify-center">
            <AuthForm />
          </div>
        )}
        {isLoggedInStore.data.status === "loading" && <PageLoading />}
      </Layout>
    </>
  );
}
