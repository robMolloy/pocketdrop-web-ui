import { FileDetails } from "@/components/FileDetails";
import { FileIcon, getFileExtension } from "@/components/FileIcon";
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

const StarredPage = () => {
  const filesStore = useFilesStore();
  const rightSidebarStore = useRightSidebarStore();

  const starredFiles = filesStore.data?.filter((file) => file.isStarred) ?? [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

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
            const fileName = file.filePath.split("/").pop() || "";
            const directoryPath = file.filePath.substring(0, file.filePath.lastIndexOf("/"));

            return (
              <TableRow
                key={file.id}
                className="c cursor-pointer"
                onClick={() => {
                  rightSidebarStore.setData(
                    <RightSidebarContent title="File Details">
                      <FileDetails file={file} onDelete={() => rightSidebarStore.close()} />
                    </RightSidebarContent>,
                  );
                }}
              >
                <TableCell className="flex items-center gap-2">
                  <FileIcon extension={getFileExtension(file)} size={24} />
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
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default StarredPage;
