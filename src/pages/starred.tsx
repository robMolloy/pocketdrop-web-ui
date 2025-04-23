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

const StarredPageTableRow = ({ file }: { file: TFileRecord }) => {
  const rightSidebarStore = useRightSidebarStore();
  const fileName = file.filePath.split("/").pop() || "";
  const directoryPath = file.filePath.substring(0, file.filePath.lastIndexOf("/"));
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  useEffect(() => {
    const extension = getFileExtension(file);
    if (!imageExtensions.includes(extension ?? "")) return;

    (async () => {
      const resp = await getFile({ pb, id: file.id, isThumb: true });
      if (resp.success) {
        const url = URL.createObjectURL(resp.data.file);
        setThumbnailUrl(url);
        return () => URL.revokeObjectURL(url);
      }
    })();
  }, [file.id]);

  return (
    <TableRow
      className="cursor-pointer"
      onClick={() => {
        rightSidebarStore.setData(
          <RightSidebarContent title="File Details">
            <FileDetails file={file} onDelete={() => rightSidebarStore.close()} />
          </RightSidebarContent>,
        );
      }}
    >
      <TableCell className="flex items-center gap-2">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={fileName} className="h-6 w-6 object-contain" />
        ) : (
          <FileIcon extension={getFileExtension(file)} size={24} />
        )}
        <span>{fileName}</span>
      </TableCell>
      <TableCell>
        <Link
          href={`/browse${directoryPath}`}
          onClick={(e) => e.stopPropagation()}
          className="hover:underline"
        >
          {directoryPath}
        </Link>
      </TableCell>
      <TableCell>{getFileExtension(file) || "Unknown"}</TableCell>
      <TableCell>{formatDate(file.created)}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <ToggleableStar file={file} size="sm" />
        </div>
      </TableCell>
    </TableRow>
  );
};

const StarredPage = () => {
  const filesStore = useFilesStore();
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
          {starredFiles.map((file) => (
            <StarredPageTableRow key={file.id} file={file} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default StarredPage;
