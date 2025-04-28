import { DisplayFileIconView } from "@/modules/files/components/DisplayFileIconView";
import { TFileRecord } from "@/modules/files/dbFilesUtils";
import { TDirectoryWithFullPath } from "@/modules/files/directoriesStore";
import { Folder } from "lucide-react";
import { useRouter } from "next/router";
import { ToggleableDirectoryStar } from "@/components/ToggleableDirectoryStar";
import { DirectoryActionsDropdownMenu } from "./DirectoryActionsDropdownMenu";

const DisplayDirectoryIconView = (p: { directory: TDirectoryWithFullPath }) => {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/browse${p.directory.fullPath}`)}
      className="group relative flex cursor-pointer flex-col items-center rounded-lg border p-4 hover:bg-accent"
    >
      <div className="absolute right-2 top-2">
        <ToggleableDirectoryStar directory={p.directory} size="sm" />
      </div>
      <Folder className="mb-2" size={60} />
      <span className="break-all text-center text-sm">{p.directory.name}</span>
      <div className="absolute left-2 top-2 opacity-40 group-hover:opacity-100">
        <DirectoryActionsDropdownMenu directory={p.directory} />
      </div>
    </div>
  );
};

export const DisplayDirectoriesAndFilesIconView = (p: {
  files: TFileRecord[];
  directories: TDirectoryWithFullPath[];
  parentDirectories: TDirectoryWithFullPath[];
}) => {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {p.directories.map((x) => (
        <DisplayDirectoryIconView key={x.id} directory={x} />
      ))}

      {p.files.map((file) => {
        const directory = p.parentDirectories.find((x) => x.id === file.directoryRelationId);

        if (!directory) return <></>;

        return <DisplayFileIconView key={file.id} file={file} parentDirectory={directory} />;
      })}
    </div>
  );
};
