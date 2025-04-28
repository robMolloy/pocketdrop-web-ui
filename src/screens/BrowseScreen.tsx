import * as React from "react";
import { CreateDirectoryForm } from "@/components/CreateDirectoryForm";
import { FileDetails } from "@/components/FileDetails";
import { FileIcon, getFileExtension } from "@/components/FileIcon";
import { ModalContent } from "@/components/Modal";
import { RightSidebarContent } from "@/components/RightSidebar";
import { ToggleableStar } from "@/components/ToggleableStar";
import { Button } from "@/components/ui/button";
import { FileUploader } from "@/modules/files/FileUploader";
import { TDirectoryWithFullPath, useDirectoryTreeStore } from "@/modules/files/directoriesStore";
import { TFileRecord, updateFile } from "@/modules/files/dbFilesUtils";
import { useFilesStore } from "@/modules/files/filesStore";
import { useModalStore } from "@/stores/modalStore";
import { useRightSidebarStore } from "@/stores/rightSidebarStore";
import { ChevronRight, Folder, MoreVertical, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { pb } from "@/config/pocketbaseConfig";

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
          <IconViewFile key={file.id} file={file} directory={p.directory} />
        ))}
      </div>
    </>
  );
};

const IconViewFile = (p: { file: TFileRecord; directory: TDirectoryWithFullPath }) => {
  const rightSidebarStore = useRightSidebarStore();
  const modalStore = useModalStore();
  return (
    <div
      onClick={async () => {
        rightSidebarStore.setData(
          <RightSidebarContent title="File Details">
            <FileDetails
              file={p.file}
              directory={p.directory}
              onDelete={() => rightSidebarStore.close()}
            />
          </RightSidebarContent>,
        );
      }}
      className="group relative flex cursor-pointer flex-col items-center rounded-lg border p-4 hover:bg-accent"
    >
      <div className="absolute left-2 top-2">
        <ToggleableStar file={p.file} size="sm" />
      </div>
      <FileIcon extension={getFileExtension(p.file)} />
      <span className="break-all text-center text-sm">{p.file.name}</span>
      <div className="absolute right-2 top-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100"
              onClick={async (e) => e.stopPropagation()}
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={async (e) => {
                e.stopPropagation();
                modalStore.setData(
                  <ModalContent
                    title="Rename"
                    description={`Rename ${p.file.name}`}
                    content={<RenameFileForm file={p.file} onSuccess={() => modalStore.close()} />}
                  />,
                );
              }}
            >
              Rename
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

const RenameFileForm = (p: { file: TFileRecord; onSuccess: () => void }) => {
  const [newName, setNewName] = React.useState(p.file.name);
  const [isLoading, setIsLoading] = React.useState(false);

  return (
    <form
      onSubmit={async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading) return;

        setIsLoading(true);

        await (async () => {
          const resp = await updateFile({ pb, data: { ...p.file, name: newName } });
          if (resp.success) return p.onSuccess();
          console.error("Failed to rename file:", resp.error);
        })();

        setIsLoading(false);
      }}
      className="flex flex-col gap-4"
    >
      <Input
        type="text"
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
        placeholder="Enter new name"
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Renaming..." : "Rename"}
      </Button>
    </form>
  );
};
