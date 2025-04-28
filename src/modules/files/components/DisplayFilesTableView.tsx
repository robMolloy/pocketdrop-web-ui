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
import { pb } from "@/config/pocketbaseConfig";
import { getFile, TFileRecord } from "@/modules/files/dbFilesUtils";
import { TDirectoryWithFullPath } from "@/modules/files/directoriesStore";
import { FileActionsDropdownMenu } from "@/modules/files/components/FileActionsDropdownMenu";
import { useRightSidebarStore } from "@/stores/rightSidebarStore";
import Link from "next/link";
import { useEffect, useState } from "react";

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
              parentDirectory={p.directory}
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
          <FileIcon extension={getFileExtension(p.file)} size="lg" />
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
          <FileActionsDropdownMenu file={p.file} />
        </div>
      </TableCell>
    </TableRow>
  );
};
export const DisplayDirectoriesAndFilesTableView = (p: {
  files: TFileRecord[];
  directories: TDirectoryWithFullPath[];
  parentDirectories: TDirectoryWithFullPath[];
}) => {
  return (
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
        {p.files.map((file) => {
          const directory = p.parentDirectories.find((x) => x.id === file.directoryRelationId);
          if (!directory) return <></>;

          return <StarredPageTableRow key={file.id} file={file} directory={directory} />;
        })}
      </TableBody>
    </Table>
  );
};
