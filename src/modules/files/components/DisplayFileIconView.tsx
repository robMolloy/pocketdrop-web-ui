import { FileDetails } from "@/components/FileDetails";
import { FileIcon, getFileExtension } from "@/components/FileIcon";
import { RightSidebarContent } from "@/components/RightSidebar";
import { ToggleableStar } from "@/components/ToggleableStar";
import { FileActionsDropdownMenu } from "@/modules/files/components/FileActionsDropdownMenu";
import { TFileRecord } from "@/modules/files/dbFilesUtils";
import { TDirectoryWithFullPath } from "@/modules/files/directoriesStore";
import { useRightSidebarStore } from "@/stores/rightSidebarStore";

export const DisplayFileIconView = (p: {
  file: TFileRecord;
  parentDirectory: TDirectoryWithFullPath;
}) => {
  const rightSidebarStore = useRightSidebarStore();

  return (
    <div
      onClick={async () => {
        rightSidebarStore.setData(
          <RightSidebarContent title="File Details">
            <FileDetails
              file={p.file}
              parentDirectory={p.parentDirectory}
              onDelete={() => rightSidebarStore.close()}
            />
          </RightSidebarContent>,
        );
      }}
      className="group relative flex cursor-pointer flex-col items-center rounded-lg border p-4 hover:bg-accent"
    >
      <div className="absolute right-2 top-2">
        <ToggleableStar file={p.file} size="sm" />
      </div>
      <span className="mb-2">
        <FileIcon extension={getFileExtension(p.file)} size="2xl" />
      </span>
      <span className="break-all text-center text-sm">{p.file.name}</span>
      <div className="absolute left-2 top-2 opacity-40 group-hover:opacity-100">
        <FileActionsDropdownMenu file={p.file} />
      </div>
    </div>
  );
};
