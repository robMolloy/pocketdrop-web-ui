import { FileIcon, getFileExtension } from "@/components/FileIcon";
import { FileDetails } from "@/components/FileDetails";
import { RightSidebarContent } from "@/components/RightSidebar";
import { ToggleableStar } from "@/components/ToggleableStar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useFilesStore } from "@/modules/files/filesStore";
import { useRightSidebarStore } from "@/stores/rightSidebarStore";
import { Download, Eye } from "lucide-react";
import { pb } from "@/config/pocketbaseConfig";
import { getFile, downloadFile } from "@/modules/files/dbFilesUtils";

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
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Path</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {starredFiles.map((file) => {
            const fileName = file.filePath.split("/").pop() || "";
            const directoryPath = file.filePath.substring(0, file.filePath.lastIndexOf("/"));

            return (
              <TableRow key={file.id}>
                <TableCell className="flex items-center gap-2">
                  <FileIcon extension={getFileExtension(file)} size={24} />
                  <span>{fileName}</span>
                </TableCell>
                <TableCell>{directoryPath}</TableCell>
                <TableCell>{getFileExtension(file) || "Unknown"}</TableCell>
                <TableCell>{formatDate(file.created)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        rightSidebarStore.setData(
                          <RightSidebarContent title="File Details">
                            <FileDetails file={file} onDelete={() => rightSidebarStore.close()} />
                          </RightSidebarContent>,
                        );
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={async () => {
                        const resp = await getFile({ pb, id: file.id, isThumb: false });
                        if (resp.success) downloadFile({ data: resp.data });
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
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
