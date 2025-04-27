import { Button } from "@/components/ui/button";
import { pb } from "@/config/pocketbaseConfig";
import { logout } from "@/modules/auth/dbAuthUtils";
import { useDirectoryTreeStore } from "@/modules/files/directoriesStore";
import { useUsersStore } from "@/modules/users/usersStore";
import { useCurrentUserStore } from "@/stores/authDataStore";
import { Home, LogOut, Settings, Star, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode } from "react";
import { DirectoryTree } from "./DirectoryTree";

const SidebarButtonWrapper = (p: { children: ReactNode; href?: string }) =>
  p.href ? <Link href={p.href}>{p.children}</Link> : p.children;

const SidebarButton = (p: {
  href?: string;
  Icon: typeof Home;
  children: ReactNode;
  isHighlighted: boolean;
  onClick?: () => void;
  badgeCount?: number;
}) => {
  return (
    <SidebarButtonWrapper href={p.href}>
      <Button
        variant={p.isHighlighted ? "secondary" : "ghost"}
        className="relative w-full justify-start pl-6"
        onClick={p.onClick}
      >
        <p.Icon className="mr-2 h-4 w-4" />
        {p.children}
        {p.badgeCount !== undefined && p.badgeCount > 0 && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-destructive px-2 py-0.5 text-xs text-destructive-foreground">
            {p.badgeCount}
          </span>
        )}
      </Button>
    </SidebarButtonWrapper>
  );
};

export function LeftSidebar() {
  const router = useRouter();
  const directoryTreeStore = useDirectoryTreeStore();
  const userStore = useCurrentUserStore();
  const usersStore = useUsersStore();
  const pendingUsersCount = usersStore.data.filter((user) => user.status === "pending").length;

  return (
    <div className={"flex h-full flex-col"}>
      <div className="flex-1 overflow-y-auto p-2">
        <div className="flex flex-col gap-1">
          <SidebarButton href="/" Icon={Home} isHighlighted={router.pathname === "/"}>
            Home
          </SidebarButton>
          <SidebarButton href="/starred" Icon={Star} isHighlighted={router.pathname === "/starred"}>
            Starred
          </SidebarButton>
          {directoryTreeStore.tree !== undefined && (
            <DirectoryTree data={directoryTreeStore.tree} />
          )}
        </div>
      </div>

      <div className="border-t p-2">
        <div className="flex flex-col gap-1">
          {userStore.data?.status === "admin" && (
            <SidebarButton
              href="/users"
              Icon={Users}
              isHighlighted={router.pathname === "/users"}
              badgeCount={pendingUsersCount}
            >
              Users
            </SidebarButton>
          )}
          <SidebarButton
            href="/settings"
            Icon={Settings}
            isHighlighted={router.pathname === "/settings"}
          >
            Settings
          </SidebarButton>
          <SidebarButton Icon={LogOut} isHighlighted={false} onClick={() => logout({ pb })}>
            Log Out
          </SidebarButton>
        </div>
      </div>
    </div>
  );
}
