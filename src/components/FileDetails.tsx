import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { pb } from "@/config/pocketbaseConfig";
import { formatDate } from "@/lib/dateUtils";
import { callClaude, createUserMessage } from "@/modules/aiChat/anthropicApi";
import { convertFileToChatMessageContentFromFile } from "@/modules/aiChat/utils";
import { DisplayFileThumbnailOrIcon } from "@/modules/files/components/DisplayFilesTableView";
import {
  TFileRecord,
  deleteFile,
  downloadFile,
  getFile,
  getFileFromFileRecord,
} from "@/modules/files/dbFilesUtils";
import { TDirectoryWithFullPath } from "@/modules/files/directoriesStore";
import { formatFileSize } from "@/modules/files/fileUtils";
import React, { useState } from "react";
import { CustomIcon } from "./CustomIcon";
import { ToggleableStar } from "./ToggleableStar";
import { Button } from "./ui/button";
import { getMediaType } from "./FileIcon";

const DetailsLine = (p: {
  iconName: React.ComponentProps<typeof CustomIcon>["iconName"];
  label: string;
  value: React.ReactNode;
}) => {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span>
        <CustomIcon iconName={p.iconName} size="sm" />
      </span>
      <span className="whitespace-nowrap text-muted-foreground">{p.label}:</span>
      <span className="flex-1 truncate text-right font-mono">{p.value}</span>
    </div>
  );
};

export function FileDetails(p: {
  file: TFileRecord;
  parentDirectory: TDirectoryWithFullPath;
  onDelete: () => void;
}) {
  return (
    <>
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="flex flex-col items-center gap-4 text-xl">
            <DisplayFileThumbnailOrIcon file={p.file} size="3xl" />
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
        <DetailsLine iconName={"fileText"} label="File Size" value={formatFileSize(p.file.size)} />
        <DetailsLine
          iconName={"fileText"}
          label="Keywords"
          value={<IndexFileWithKeywordsForm file={p.file} />}
        />
      </div>
    </>
  );
}

const IndexFileWithKeywordsForm = (p: { file: TFileRecord }) => {
  const [keywords, setKeywords] = useState<string[]>();
  return (
    <div className="max-h-[200px] overflow-y-auto">
      <div>{p.file.keywords}</div>

      {!keywords && (
        <Button
          size="sm"
          variant="outline"
          onClick={async () => {
            const file = await getFileFromFileRecord({ pb, data: p.file, isThumb: false });
            if (!file.success) return console.error(`getFileFromFileRecord failed`);

            const chatMessageContentResponse = await convertFileToChatMessageContentFromFile(
              new File([file.data?.file], file.data?.name, { type: getMediaType(file.data) }),
            );

            if (!chatMessageContentResponse.success)
              return console.error(`convertFileToChatMessageContentFromFile failed`);

            const userMessage = createUserMessage([
              {
                type: "text",
                text: "return at least 30 kerywords in the JSON format {keywords:[]}, no additional keys should be added and no other text should be returned. Describe the content of the image, also include keywords that describe metadata and other available data.",
              },
              chatMessageContentResponse.data,
            ]);

            const aiResponse = await callClaude({
              messages: [{ role: userMessage.role, content: userMessage.content }],
              onFirstStream: () => {},
              onStream: () => {},
            });

            if (!aiResponse.success) return console.error(`callClaude failed`);

            const json = JSON.parse(aiResponse.data);
            const rtnKeywords = json.keywords as string[];
            setKeywords(rtnKeywords);
          }}
        >
          Index
        </Button>
      )}
      <pre>{keywords && JSON.stringify(keywords, undefined, 2)}</pre>
    </div>
  );
};
