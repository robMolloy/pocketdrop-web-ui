import { DisplayFileIconView } from "@/modules/files/DisplayFileIconView";
import { TFileRecord } from "@/modules/files/dbFilesUtils";
import { TDirectoryWithFullPath } from "@/modules/files/directoriesStore";
import { Folder } from "lucide-react";
import { useRouter } from "next/router";

const DisplayDirectoryIconView = (p: { directory: TDirectoryWithFullPath }) => {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/browse${p.directory.fullPath}`)}
      className="flex cursor-pointer flex-col items-center rounded-lg border p-4 hover:bg-accent"
    >
      <Folder className="mb-2" size={60} />
      <span className="break-all text-center text-sm">{p.directory.name}</span>
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
