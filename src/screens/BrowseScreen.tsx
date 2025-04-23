import { CreateDirectoryForm } from "@/components/CreateDirectoryForm";
import { FileDetails } from "@/components/FileDetails";
import { FileIcon, getFileExtension } from "@/components/FileIcon";
import { ModalContent } from "@/components/Modal";
import { RightSidebarContent } from "@/components/RightSidebar";
import { Button } from "@/components/ui/button";
import { FileUploader } from "@/modules/files/FileUploader";
import { useFilesStore } from "@/modules/files/filesStore";
import { useModalStore } from "@/stores/modalStore";
import { useRightSidebarStore } from "@/stores/rightSidebarStore";
import { ChevronRight, Folder, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";

export const BrowseScreen = (p: { browsePath: string }) => {
  const router = useRouter();
  const rightSidebarStore = useRightSidebarStore();
  const filesStore = useFilesStore();
  const modalStore = useModalStore();

  const currentPathDirs = !filesStore.data
    ? []
    : filesStore.data
        .filter((x) => x.filePath.startsWith(p.browsePath))
        .filter((x) => x.filePath.endsWith("/"))
        .filter((x) => x.filePath.split("/").length === p.browsePath.split("/").length + 1);

  const currentPathFiles = !filesStore.data
    ? []
    : filesStore.data
        .filter((x) => x.filePath.startsWith(p.browsePath))
        .filter((x) => !x.filePath.endsWith("/"))
        .filter((x) => x.filePath.split("/").length === p.browsePath.split("/").length);

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
            <Link href="/browse/" className="text-lg text-muted-foreground hover:text-foreground">
              /
            </Link>
            {pathSegments.map((segment) => (
              <div key={segment.path} className="flex items-center">
                <ChevronRight className="text-muted-foreground" size={15} />
                <Link
                  href={`/browse${segment.path}`}
                  className={`ml-1 text-lg ${
                    segment.isLast ? "text-muted-foreground" : "hover:underline"
                  }`}
                >
                  {segment.name}
                </Link>
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
                    <CreateDirectoryForm onSuccess={modalStore.close} currentPath={p.browsePath} />
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
        <FileUploader currentPath={p.browsePath} onUploadComplete={() => {}} />
      </div>

      <br />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {currentPathDirs
          .sort((a, b) => (a.filePath > b.filePath ? 1 : -1))
          .map((x) => (
            <div
              key={x.filePath}
              onClick={() => router.push(`/browse${x.filePath}`)}
              className="flex cursor-pointer flex-col items-center rounded-lg border p-4 hover:bg-accent"
            >
              <Folder className="mb-2" size={60} />
              <span className="break-all text-center text-sm">
                {x.filePath.split("/").splice(-2, 1).join("")}
              </span>
            </div>
          ))}

        {currentPathFiles
          .sort((a, b) => (a.filePath > b.filePath ? 1 : -1))
          .map((file) => {
            const fileName = file.filePath.split("/").pop() || "";

            return (
              <div
                key={file.id}
                onClick={async () => {
                  rightSidebarStore.setData(
                    <RightSidebarContent title="File Details">
                      <FileDetails file={file} onDelete={() => rightSidebarStore.close()} />
                    </RightSidebarContent>,
                  );
                }}
                className="flex cursor-pointer flex-col items-center rounded-lg border p-4 hover:bg-accent"
              >
                <FileIcon extension={getFileExtension(file)} />
                <span className="break-all text-center text-sm">{fileName}</span>
              </div>
            );
          })}
      </div>
    </>
  );
};
