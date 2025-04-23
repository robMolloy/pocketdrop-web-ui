import { useRightSidebarStore } from "@/stores/rightSidebarStore";
import { Header } from "./Header";
import { RightSidebar } from "./RightSidebar";
import { LeftSidebar } from "./LeftSidebar";
import { Modal } from "./Modal";

export function Layout(p: { children: React.ReactNode; showLeftSidebar: boolean }) {
  const rightSidebarStore = useRightSidebarStore();

  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        {p.showLeftSidebar && (
          <aside className="hidden h-[calc(100vh-3.5rem)] w-64 overflow-y-auto border-r bg-background md:block">
            <LeftSidebar />
          </aside>
        )}
        <main className="h-[calc(100vh-3.5rem)] w-full overflow-y-auto">
          <div className="p-6">{p.children}</div>
        </main>
      </div>
      <RightSidebar
        isOpen={rightSidebarStore.data !== null}
        onClose={() => rightSidebarStore.setData(null)}
      />
      <Modal />
    </div>
  );
}
