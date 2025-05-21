import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { pb } from "@/config/pocketbaseConfig";
import { formatDate } from "@/lib/dateUtils";
import { callClaude, createUserMessage, mediaTypeSchema } from "@/modules/aiChat/anthropicApi";
import { convertFileToBase64 } from "@/modules/aiChat/utils";
import { DisplayFileThumbnailOrIcon } from "@/modules/files/components/DisplayFilesTableView";
import {
  TFileDataRecord,
  TFileRecord,
  deleteFile,
  downloadFile,
  getFile,
  getFileDataRecordFromFileRecord,
} from "@/modules/files/dbFilesUtils";
import { TDirectoryWithFullPath } from "@/modules/files/directoriesStore";
import { formatFileSize } from "@/modules/files/fileUtils";
import { useAiStore } from "@/stores/aiStore";
import { Anthropic } from "@anthropic-ai/sdk";
import React, { useState } from "react";
import { z } from "zod";
import { CustomIcon } from "./CustomIcon";
import { getMediaType } from "./FileIcon";
import { ToggleableStar } from "./ToggleableStar";
import { Button } from "./ui/button";

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
  const aiStore = useAiStore();

  const aiInstance = aiStore.data;
  if (!aiInstance) return <div>No AI key found</div>;

  return (
    <div className="max-h-[200px] overflow-y-auto">
      <div>{p.file.keywords}</div>

      {!keywords && (
        <Button
          size="sm"
          variant="outline"
          onClick={async () => {
            const fileDataRecord = await getFileDataRecordFromFileRecord({
              pb,
              data: p.file,
              isThumb: false,
            });
            if (!fileDataRecord.success) return console.error(`getFileFromFileRecord failed`);

            const createFileFromFileDataRecord = (p: { fileDataRecord: TFileDataRecord }) => {
              return new File([p.fileDataRecord.file], p.fileDataRecord.name, {
                type: getMediaType(p.fileDataRecord),
              });
            };

            const file = createFileFromFileDataRecord({ fileDataRecord: fileDataRecord.data });

            const indexImageFileDataRecordWithAnthropicResponse = await indexFileWithAnthropic({
              anthropic: aiInstance,
              file,
              onStream: () => {},
            });

            if (!indexImageFileDataRecordWithAnthropicResponse.success)
              return console.error(`indexImageFileDataRecordWithAnthropic failed`);

            setKeywords(indexImageFileDataRecordWithAnthropicResponse.data);
          }}
        >
          Index
        </Button>
      )}
      <pre>{keywords && JSON.stringify(keywords, undefined, 2)}</pre>
    </div>
  );
};

const indexFileWithAnthropic = async (p: {
  anthropic: Anthropic;
  file: File;
  onStream: (message: string) => void;
}) => {
  const base64FileResponse = await convertFileToBase64(p.file);
  if (!base64FileResponse.success) return base64FileResponse;

  const mediaTypeResponse = mediaTypeSchema.safeParse(p.file.type);
  if (!mediaTypeResponse.success) return mediaTypeResponse;

  const userMessage = createUserMessage([
    {
      type: "text",
      text: "return at least 30 keywords in the JSON format {keywords:[]}, no additional keys should be added and no other text should be returned. Describe the content of the image, also include keywords that describe metadata and other available data.",
    },
    {
      type: "image",
      source: {
        type: "base64",
        media_type: mediaTypeResponse.data,
        data: base64FileResponse.data,
      },
    },
  ]);

  const aiResponse = await callClaude({
    anthropic: p.anthropic,
    messages: [{ role: userMessage.role, content: userMessage.content }],
    onFirstStream: () => {},
    onStream: () => {},
  });

  if (!aiResponse.success) return aiResponse;

  const jsonResponse = safeJsonParse(aiResponse.data);
  if (!jsonResponse.success) return jsonResponse;

  const schema = z.object({ keywords: z.array(z.string()) });
  const parsed = schema.safeParse(jsonResponse.data);
  if (!parsed.success) return parsed;

  return { success: true, data: parsed.data.keywords } as const;
};

const safeJsonParse = (json: string) => {
  try {
    return { success: true, data: JSON.parse(json) };
  } catch (error) {
    return { success: false, error };
  }
};
