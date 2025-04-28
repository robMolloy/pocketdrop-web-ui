import { CreateDirectoryInModalButton } from "@/components/CreateDirectoryForm";
import { DisplayDirectoriesAndFilesIconView } from "@/modules/directories/components/DisplayDirectoriesAndFilesIconView";
import { DisplayDirectoriesAndFilesTableView } from "@/modules/files/DisplayFilesTableView";
// import { DisplayFilesTableView } from "@/modules/files/DisplayFilesTableView";
import { FileUploader } from "@/modules/files/FileUploader";
import { TDirectoryWithFullPath, useDirectoryTreeStore } from "@/modules/files/directoriesStore";
import { useFilesStore } from "@/modules/files/filesStore";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
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

        <CreateDirectoryInModalButton
          browsePath={p.browsePath}
          parentDirectoryId={p.directory.id}
        />
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

      <DisplayDirectoriesAndFilesIconView
        files={filesInCurrentDirectory}
        directories={dirsInCurrentDirectory}
        parentDirectories={[p.directory]}
      />
      <DisplayDirectoriesAndFilesTableView
        files={filesInCurrentDirectory}
        directories={dirsInCurrentDirectory}
        parentDirectories={[p.directory]}
      />
    </>
  );
};
