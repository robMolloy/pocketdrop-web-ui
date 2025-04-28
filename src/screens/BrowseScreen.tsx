import { CreateDirectoryForm } from "@/components/CreateDirectoryForm";
import { ModalContent } from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { DisplayFileIconView } from "@/modules/files/DisplayFileIconView";
import { FileUploader } from "@/modules/files/FileUploader";
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

export const BrowseScreen = (p: { browsePath: string; directory: TDirectoryWithFullPath }) => {
  const router = useRouter();
  const filesStore = useFilesStore();
  const modalStore = useModalStore();
  const directoryTreeStore = useDirectoryTreeStore();

  const currentPathDirs = directoryTreeStore.fullPaths
    ? directoryTreeStore.fullPaths.filter((x) => x.directoryRelationId === p.directory.id)
    : [];

  const currentPathFiles = filesStore.data
    ? filesStore.data.filter((x) => x.directoryRelationId === p.directory.id)
    : [];

  // Create breadcrumb segments
  const pathSegments = p.browsePath
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
    <>
      <div className="flex items-end justify-between">
        <div className="flex items-end gap-2">
          <h1 className="mb-0 text-2xl font-bold">Current Path:</h1>
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
        {currentPathDirs
          .sort((a, b) => (a?.fullPath > b?.fullPath ? 1 : -1))
          .map((x) => (
            <div
              key={x.fullPath}
              onClick={() => router.push(`/browse${x.fullPath}`)}
              className="flex cursor-pointer flex-col items-center rounded-lg border p-4 hover:bg-accent"
            >
              <Folder className="mb-2" size={60} />
              <span className="break-all text-center text-sm">
                {x.fullPath.split("/").splice(-2, 1).join("")}
              </span>
            </div>
          ))}

        {currentPathFiles.map((file) => (
          <DisplayFileIconView key={file.id} file={file} directory={p.directory} />
        ))}
      </div>
    </>
  );
};
