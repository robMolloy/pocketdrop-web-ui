import { FileIcon, getFileExtension, imageExtensions } from "@/components/FileIcon";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { pb } from "@/config/pocketbaseConfig";
import { TFileRecord, deleteFile, downloadFile, getFile } from "@/modules/files/dbFilesUtils";
import React, { useEffect, useState } from "react";
import { ToggleableStar } from "./ToggleableStar";
import { Button } from "./ui/button";
import { TDirectoryWithFullPath } from "@/modules/files/directoriesStore";
import { CustomIcon } from "./CustomIcon";
import { formatDate } from "@/utils/dateUtils";

const DetailsLine = (p: {
  iconName: React.ComponentProps<typeof CustomIcon>["iconName"];
  label: string;
  value: string;
}) => {
  return (
    <div className="flex items-center gap-2 text-sm">
      <CustomIcon iconName={p.iconName} size="sm" />
      <span className="text-muted-foreground">{p.label}:</span>
      <span className="font-mono">{p.value}</span>
    </div>
  );
};

export function FileDetails(p: {
  file: TFileRecord;
  parentDirectory: TDirectoryWithFullPath;
  onDelete: () => void;
}) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  useEffect(() => {
    const extension = getFileExtension(p.file);
    if (!imageExtensions.includes(extension ?? "")) return;

    (async () => {
      const resp = await getFile({ pb, id: p.file.id, isThumb: true });
      if (resp.success) {
        const url = URL.createObjectURL(resp.data.file);
        setThumbnailUrl(url);
        return () => URL.revokeObjectURL(url);
      }
    })();
  }, [p.file.id]);

  return (
    <>
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="flex flex-col items-center gap-4 text-xl">
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt={p.file.name}
                className="h-[120px] w-[120px] object-contain"
              />
            ) : (
              <FileIcon extension={getFileExtension(p.file)} size="2xl" />
            )}
            <div className="flex items-center gap-2 text-center text-xl">
              {p.file.name}
              <ToggleableStar file={p.file} />
            </div>

            <div className="mt-2 flex gap-2">
              <Button
                className="flex-1"
                onClick={async () => {
                  const resp = await getFile({ pb, id: p.file.id, isThumb: false });
                  if (resp.success) downloadFile({ data: resp.data });
                }}
              >
                <CustomIcon iconName="download" size="md" />
                Download
              </Button>
              <Button
                variant="destructive"
                className="flex flex-1 gap-2"
                onClick={async () => {
                  const result = await deleteFile({ pb, id: p.file.id });
                  if (result.success) p.onDelete();
                }}
              >
                <CustomIcon iconName="trash2" size="md" />
                Delete
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      <br />
      <div className="mb-2 flex items-center gap-2 text-xl">Information</div>

      <div className="flex flex-col gap-2">
        <DetailsLine iconName={"hash"} label="ID" value={p.file.id} />
        <DetailsLine
          iconName={"folder"}
          label="Directory Path"
          value={p.parentDirectory.fullPath}
        />
        <DetailsLine iconName={"calendar"} label="Created" value={formatDate(p.file.created)} />
        <DetailsLine iconName={"calendar"} label="Updated" value={formatDate(p.file.updated)} />
        <DetailsLine iconName={"hash"} label="Collection ID" value={p.file.collectionId} />
        <DetailsLine iconName={"folder"} label="Collection Name" value={p.file.collectionName} />
        <DetailsLine iconName={"fileText"} label="File" value={p.file.file} />
      </div>
    </>
  );
}
