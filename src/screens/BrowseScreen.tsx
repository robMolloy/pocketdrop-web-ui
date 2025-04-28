import { CreateDirectoryForm } from "@/components/CreateDirectoryForm";
import { ModalContent } from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { DisplayFileIconView } from "@/modules/files/DisplayFileIconView";
// import { DisplayFilesTableView } from "@/modules/files/DisplayFilesTableView";
import { FileUploader } from "@/modules/files/FileUploader";
import { TFileRecord } from "@/modules/files/dbFilesUtils";
import { TDirectoryWithFullPath, useDirectoryTreeStore } from "@/modules/files/directoriesStore";
import { useFilesStore } from "@/modules/files/filesStore";
import { useModalStore } from "@/stores/modalStore";
import { ChevronRight, Folder, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode } from "react";

const BreadcrumbLink = (p: { isLast: boolean; href: string; children: ReactNode }) => {
  return (
    <Link
      href={p.href}
      className={`ml-1 text-lg ${p.isLast ? "text-muted-foreground" : "hover:underline"}`}
    >
      {p.children}
    </Link>
  );
};

const Breadcrumbs = (p: { path: string }) => {
  const pathSegments = p.path
    .split("/")
    .filter(Boolean)
    .map((segment, index, array) => {
      const path = "/" + array.slice(0, index + 1).join("/") + "/";
      return {
        name: segment,
        path,
        isLast: index === array.length - 1,
      };
    });

  return (
    <div className="flex items-center gap-1">
      <BreadcrumbLink isLast={pathSegments.length === 0} href="/browse/">
        /
      </BreadcrumbLink>
      {pathSegments.map((segment) => (
        <div key={segment.path} className="flex items-center">
          <ChevronRight className="text-muted-foreground" size={15} />
          <BreadcrumbLink href={`/browse${segment.path}`} isLast={segment.isLast}>
            {segment.name}
          </BreadcrumbLink>
        </div>
      ))}
    </div>
  );
};

export const BrowseScreen = (p: { browsePath: string; directory: TDirectoryWithFullPath }) => {
  const filesStore = useFilesStore();
  const modalStore = useModalStore();
  const directoryTreeStore = useDirectoryTreeStore();

  const dirsInCurrentDirectory = directoryTreeStore.fullPaths
    ? directoryTreeStore.fullPaths.filter((x) => x.directoryRelationId === p.directory.id)
    : [];

  const filesInCurrentDirectory = filesStore.data
    ? filesStore.data.filter((x) => x.directoryRelationId === p.directory.id)
    : [];

  return (
    <>
      <div className="flex items-end justify-between">
        <div className="flex items-end gap-2">
          <h1 className="mb-0 text-2xl font-bold">Current Path:</h1>
          <Breadcrumbs path={p.browsePath} />
        </div>
        <div className="flex items-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              modalStore.setData(
                <ModalContent
                  title="New directory"
                  description={`Create a new directory at ${p.browsePath}`}
                  content={
                    <CreateDirectoryForm
                      onSuccess={modalStore.close}
                      currentPath={p.browsePath}
                      parentDirectoryId={p.directory.id}
                    />
                  }
                />,
              )
            }
          >
            <Plus /> New Directory
          </Button>
        </div>
      </div>

      <br />

      <div>
        <FileUploader
          currentPath={p.browsePath}
          parentDirectoryId={p.directory.id}
          onUploadComplete={() => {}}
        />
      </div>

      <br />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {dirsInCurrentDirectory.map((x) => (
          <DisplayDirectoryIconView key={x.id} directory={x} />
        ))}

        {filesInCurrentDirectory.map((file) => (
          <DisplayFileIconView key={file.id} file={file} parentDirectory={p.directory} />
        ))}
      </div>
      {/* <div>
        <DisplayFilesTableView files={currentPathFiles} relevantParentDirectories={[p.directory]} />
      </div> */}
    </>
  );
};

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
