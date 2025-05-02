import Link from "next/link";
import { CustomIcon } from "./CustomIcon";
import { ThemeToggle } from "./ThemeToggle";
import { Input } from "./ui/input";
import React, { useState } from "react";
import { useFilesStore } from "@/modules/files/filesStore";
import { useDirectoryTreeStore } from "@/modules/files/directoriesStore";
import { useRouter } from "next/router";

const SearchInput = () => {
  const filesStore = useFilesStore();
  const { fullPaths: directoriesStore } = useDirectoryTreeStore();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestedFiles =
    filesStore.data?.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase())) ??
    [];

  return (
    <div className="relative mx-4 w-96">
      <Input
        type="search"
        placeholder="Search..."
        className="w-full"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 100000)}
      />
      {showSuggestions && searchTerm && suggestedFiles.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-background shadow-lg">
          {suggestedFiles.map((file) =>
            (() => {
              const directory = directoriesStore?.find((x) => x.id === file.directoryRelationId);
              if (!directory) return <React.Fragment key={file.id}></React.Fragment>;
              return (
                <div
                  key={file.id}
                  className="flex cursor-pointer items-center justify-between gap-4 px-4 py-2 hover:bg-accent hover:text-accent-foreground"
                  onClick={() => {
                    router.push(`/browse${directory.fullPath}`);
                    setSearchTerm(file.name);
                    setShowSuggestions(false);
                  }}
                >
                  <div className="flex-1 overflow-hidden overflow-ellipsis whitespace-nowrap text-sm">
                    {file.name}
                  </div>
                  <div className="w-32 shrink-0 overflow-hidden overflow-ellipsis whitespace-nowrap text-right text-xs text-muted-foreground">
                    {directory.fullPath}
                  </div>
                </div>
              );
            })(),
          )}
        </div>
      )}
    </div>
  );
};

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 flex-1 items-center justify-between px-8">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <CustomIcon iconName="cloud" size="lg" />
          <span className="font-bold">PocketDrop</span>
        </Link>
        <div>
          <SearchInput />
        </div>
        <nav className="flex items-center space-x-2">
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
