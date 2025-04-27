import { Layout } from "@/components/Layout";
import { PageLoading } from "@/components/PageLoading";
import { pb } from "@/config/pocketbaseConfig";
import { AuthForm } from "@/modules/auth/AuthForm";
import { smartSubscribeToDirectories } from "@/modules/directories/dbDirectoriesUtils";
import { smartSubscribeToFiles } from "@/modules/files/dbFilesUtils";
import { useDirectoriesStore } from "@/modules/files/directoriesStore";
import { useFilesStore } from "@/modules/files/filesStore";
import { smartSubscribeToUsers } from "@/modules/users/dbUsersUtils";
import { useUsersStore } from "@/modules/users/usersStore";
import { useAuthDataSync, useIsLoggedInStore } from "@/stores/authDataStore";
import { useThemeStore } from "@/stores/themeStore";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect } from "react";

export default function App({ Component, pageProps }: AppProps) {
  const themeStore = useThemeStore();
  const isLoggedInStore = useIsLoggedInStore();
  const filesStore = useFilesStore();
  const directoriesStore = useDirectoriesStore();
  // const directoryTreeStore = useDirectoryTreeStore();
  const usersStore = useUsersStore();

  themeStore.useThemeStoreSideEffect();
  useAuthDataSync({ pb: pb });

  useEffect(() => {
    if (isLoggedInStore.data.status === "loggedIn") {
      smartSubscribeToDirectories({ pb, onChange: (x) => directoriesStore.setData(x) });
      smartSubscribeToFiles({ pb, onChange: (x) => filesStore.setData(x) });
      smartSubscribeToUsers({ pb, onChange: (x) => usersStore.setData(x) });
    } else {
      directoriesStore.clear();
      filesStore.clear();
      usersStore.clear();
    }
  }, [isLoggedInStore.data]);

  return (
    <>
      {/* <pre>{JSON.stringify(directoriesStore, undefined, 2)}</pre>
      <pre>{JSON.stringify(directoryTreeStore, undefined, 2)}</pre> */}
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
