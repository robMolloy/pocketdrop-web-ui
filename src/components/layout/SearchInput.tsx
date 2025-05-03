import { useDirectoryTreeStore } from "@/modules/files/directoriesStore";
import { useFilesStore } from "@/modules/files/filesStore";
import { useRightSidebarStore } from "@/stores/rightSidebarStore";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { Input } from "../ui/input";

const SearchInput = () => {
  const rightSidebarStore = useRightSidebarStore();
  const filesStore = useFilesStore();
  const { fullPaths: directoriesStore } = useDirectoryTreeStore();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestionsDropdown, setShowSuggestionsDropdown] = useState(false);

  const suggestedFiles =
    filesStore.data?.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase())) ??
    [];

  const isSuggestionsDropdownShown =
    showSuggestionsDropdown && searchTerm && suggestedFiles.length > 0;

  return (
    <div className="relative mx-4 w-96">
      <Input
        type="search"
        placeholder="Search..."
        className="w-full"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setShowSuggestionsDropdown(true);
        }}
        onFocus={() => setShowSuggestionsDropdown(true)}
        onBlur={() => setTimeout(() => setShowSuggestionsDropdown(false), 250)}
      />
      <div
        className={`absolute z-50 mt-1 max-h-96 w-full overflow-y-scroll rounded-md border bg-background shadow-lg ${isSuggestionsDropdownShown ? "" : "hidden"}`}
      >
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
                  setShowSuggestionsDropdown(false);
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
    </div>
  );
};

export default SearchInput;
