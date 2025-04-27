// import { useRightSidebarStore } from "@/stores/rightSidebarStore";
// import { useRouter } from "next/router";
import { Cloud } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  // const router = useRouter();
  // const fullPath = router.asPath;

  // const rightSidebarStore = useRightSidebarStore();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 flex-1 items-center justify-between px-8">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <Cloud className="h-5 w-5" />
          <span className="font-bold">PocketDrop</span>
        </Link>
        <nav className="flex items-center space-x-2">
          {/* {fullPath.startsWith("/browse") && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() =>
                rightSidebarStore.setData(
                  <RightSidebarContent title="Upload Files">
                    <FileUploader currentPath={fullPath.slice(7)} onUploadComplete={() => {}} />
                  </RightSidebarContent>,
                )
              }
            >
              <Upload className="h-4 w-4" />
              Upload
            </Button>
          )} */}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
