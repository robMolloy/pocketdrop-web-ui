import { FileDetails } from "@/components/FileDetails";
import { FileIcon, getFileExtension, imageExtensions } from "@/components/FileIcon";
import { RightSidebarContent } from "@/components/RightSidebar";
import { ToggleableStar } from "@/components/ToggleableStar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableHeaderRow,
  TableRow,
} from "@/components/ui/table";
import { useFilesStore } from "@/modules/files/filesStore";
import { useRightSidebarStore } from "@/stores/rightSidebarStore";
import Link from "next/link";
import { TFileRecord } from "@/modules/files/dbFilesUtils";
import { pb } from "@/config/pocketbaseConfig";
import { getFile } from "@/modules/files/dbFilesUtils";
import { useEffect, useState } from "react";
import { TDirectoryWithFullPath, useDirectoryTreeStore } from "@/modules/files/directoriesStore";

const StarredPageTableRow = (p: { file: TFileRecord; directory: TDirectoryWithFullPath }) => {
  const rightSidebarStore = useRightSidebarStore();

  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  useEffect(() => {
    const extension = getFileExtension(p.file);
    if (!imageExtensions.includes(extension)) return;

    (async () => {
      const resp = await getFile({ pb, id: p.file.id, isThumb: true });
      if (resp.success) {
        const url = URL.createObjectURL(resp.data.file);
        setThumbnailUrl(url);
        return () => URL.revokeObjectURL(url);
      }
    })();
  }, [p.file.file]);

  return (
    <TableRow
      className="cursor-pointer"
      onClick={() => {
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
    >
      <TableCell className="flex items-center gap-2">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={p.file.name} className="h-6 w-6 object-contain" />
        ) : (
          <FileIcon extension={getFileExtension(p.file)} size={24} />
        )}
        <span>{p.file.name}</span>
      </TableCell>
      <TableCell>
        <Link
          href={`/browse${p.directory.fullPath}`}
          onClick={(e) => e.stopPropagation()}
          className="hover:underline"
        >
          {p.directory.fullPath}
        </Link>
      </TableCell>
      <TableCell>{getFileExtension(p.file) || "Unknown"}</TableCell>
      <TableCell>{formatDate(p.file.created)}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <ToggleableStar file={p.file} size="sm" />
        </div>
      </TableCell>
    </TableRow>
  );
};

const StarredPage = () => {
  const filesStore = useFilesStore();
  const directoriesStore = useDirectoryTreeStore();
  const starredFiles =
    filesStore.data
      ?.filter((file) => file.isStarred)
      ?.filter((file) => !file.filePath.endsWith("/")) ?? [];

  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold">Starred Files</h1>

      <Table>
        <TableHeader>
          <TableHeaderRow>
            <TableHead>Name</TableHead>
            <TableHead>Path</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Created</TableHead>
            <TableHead></TableHead>
          </TableHeaderRow>
        </TableHeader>
        <TableBody>
          {starredFiles.map((file) => {
            const directory = directoriesStore.fullPaths?.find(
              (x) => x.id === file.directoryRelationId,
            );
            if (!directory) return <></>;

            return <StarredPageTableRow key={file.id} file={file} directory={directory} />;
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default StarredPage;
