import { Layout } from "@/components/layout/Layout";
import { PageLoading } from "@/components/PageLoading";
import { pb } from "@/config/pocketbaseConfig";
import { AuthForm } from "@/modules/auth/AuthForm";
import { smartSubscribeToDirectories } from "@/modules/directories/dbDirectoriesUtils";
import { smartSubscribeToFiles } from "@/modules/files/dbFilesUtils";
import { useDirectoriesStore } from "@/modules/files/directoriesStore";
import { useFilesStore } from "@/modules/files/filesStore";
import { smartSubscribeToSettings } from "@/modules/settings/dbSettingsUtils";
import { useSettingsStore } from "@/modules/settings/settingsStore";
import { smartSubscribeToUsers, subscribeToUser } from "@/modules/users/dbUsersUtils";
import { useUsersStore } from "@/modules/users/usersStore";
import {
  useAuthDataSync,
  useNewCurrentUserStore,
  useUnverifiedIsLoggedInStore,
} from "@/stores/authDataStore";
import { useThemeStore } from "@/stores/themeStore";
import "@/styles/globals.css";
import "@/styles/markdown.css";
import type { AppProps } from "next/app";
import { useEffect } from "react";

export default function App({ Component, pageProps }: AppProps) {
  const themeStore = useThemeStore();
  const unverifiedIsLoggedInStore = useUnverifiedIsLoggedInStore();
  const filesStore = useFilesStore();
  const directoriesStore = useDirectoriesStore();
  // const directoryTreeStore = useDirectoryTreeStore();
  const usersStore = useUsersStore();
  const settingsStore = useSettingsStore();
  const newCurrentUserStore = useNewCurrentUserStore();

  themeStore.useThemeStoreSideEffect();
  useAuthDataSync({ pb: pb });

  useEffect(() => {
    if (unverifiedIsLoggedInStore.data.status === "loggedIn") {
      subscribeToUser({
        pb,
        id: unverifiedIsLoggedInStore.data.auth.record.id,
        onChange: (user) => {
          if (user) newCurrentUserStore.setData({ status: "loggedIn", user });
          else newCurrentUserStore.setData({ status: "loggedOut" });
        },
      });
    } else newCurrentUserStore.setData({ status: "loggedOut" });
  }, [unverifiedIsLoggedInStore.data]);

  useEffect(() => {
    if (newCurrentUserStore.data.status === "loggedIn") {
      smartSubscribeToDirectories({ pb, onChange: (x) => directoriesStore.setData(x) });
      smartSubscribeToFiles({ pb, onChange: (x) => filesStore.setData(x) });
      smartSubscribeToUsers({ pb, onChange: (x) => usersStore.setData(x) });
      smartSubscribeToSettings({ pb, onChange: (x) => settingsStore.setData(x) });
    } else {
      directoriesStore.clear();
      filesStore.clear();
      usersStore.clear();
      settingsStore.clear();
    }
  }, [newCurrentUserStore.data]);

  return (
    <>
      {/* <pre>{JSON.stringify(directoriesStore, undefined, 2)}</pre>
      <pre>{JSON.stringify(directoryTreeStore, undefined, 2)}</pre> */}
      <Layout showLeftSidebar={newCurrentUserStore.data.status === "loggedIn"}>
        {(() => {
          if (newCurrentUserStore.data.status === "loading") return <PageLoading />;

          if (newCurrentUserStore.data.status === "loggedOut")
            return (
              <div className="flex justify-center">
                <AuthForm />
              </div>
            );
          if (
            newCurrentUserStore.data.status === "loggedIn" &&
            newCurrentUserStore.data.user.status === "pending"
          )
            return <div>awaiting approval</div>;
          if (
            newCurrentUserStore.data.status === "loggedIn" &&
            newCurrentUserStore.data.user.status === "denied"
          )
            return <div>blocked</div>;
          if (newCurrentUserStore.data.status === "loggedIn") return <Component {...pageProps} />;
        })()}
      </Layout>
    </>
  );
}
