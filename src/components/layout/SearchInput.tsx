import { useDirectoryTreeStore } from "@/modules/files/directoriesStore";
import { useFilesStore } from "@/modules/files/filesStore";
import { useRightSidebarStore } from "@/stores/rightSidebarStore";
import { useRouter } from "next/router";
import React, { useState, useRef } from "react";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

const SearchInput = () => {
  const rightSidebarStore = useRightSidebarStore();
  const filesStore = useFilesStore();
  const { fullPaths: directoriesStore } = useDirectoryTreeStore();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);

  const suggestedFiles =
    filesStore.data?.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase())) ??
    [];

  return (
    <div className="relative mx-4 w-96">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div>
            <Input
              ref={inputRef}
              type="search"
              placeholder="Search..."
              className="w-full"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setOpen(true);
              }}
              onFocus={() => {
                // setOpen(true);
                inputRef.current?.focus();
              }}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            inputRef.current?.focus();
          }}
        >
          <div className="max-h-96 overflow-y-auto">
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
                      rightSidebarStore.showFileDetails({
                        file: file,
                        parentDirectory: directory,
                        onDelete: () => rightSidebarStore.close(),
                      });
                      setSearchTerm(file.name);
                      setOpen(false);
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
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SearchInput;
