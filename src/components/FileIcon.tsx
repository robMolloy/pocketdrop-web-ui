import { TFile, TFileRecord } from "@/modules/files/dbFilesUtils";
import {
  File,
  FileArchive,
  FileAudio,
  FileCode,
  FileText,
  FileVideo,
  Image,
  FileSpreadsheet,
  Presentation,
} from "lucide-react";

export const getFileExtension = (file: TFileRecord | TFile) => {
  return file.filePath.split(".").pop()?.toLowerCase() ?? "";
};

export const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "tiff", "ico"];
export const textExtensions = [
  "txt",
  "md",
  "json",
  "csv",
  "rtf",
  "log",
  "doc",
  "docx",
  "pdf",
  "odt",
  "pages",
];
const codeExtensions = [
  "js",
  "jsx",
  "ts",
  "tsx",
  "html",
  "css",
  "py",
  "java",
  "cpp",
  "c",
  "h",
  "hpp",
  "php",
  "rb",
  "swift",
  "kt",
  "go",
  "rs",
  "sql",
  "sh",
  "bash",
  "yml",
  "yaml",
  "xml",
];
const fileExtensions = ["zip", "rar", "7z", "tar", "gz", "bz2", "xz", "iso", "dmg"];
const audioExtensions = ["mp3", "wav", "ogg", "m4a", "flac", "aac", "wma", "mid", "midi"];
const videoExtensions = [
  "mp4",
  "mov",
  "avi",
  "webm",
  "mkv",
  "flv",
  "wmv",
  "m4v",
  "mpeg",
  "mpg",
  "3gp",
];
const spreadsheetExtensions = ["xls", "xlsx", "ods", "numbers"];
const presentationExtensions = ["ppt", "pptx", "odp", "key"];

export function FileIcon(p: { extension: string; size?: number }) {
  const FileComp = p.extension
    ? File
    : (() => {
        if (imageExtensions.includes(p.extension)) return Image;
        if (textExtensions.includes(p.extension)) return FileText;
        if (codeExtensions.includes(p.extension)) return FileCode;
        if (fileExtensions.includes(p.extension)) return FileArchive;
        if (audioExtensions.includes(p.extension)) return FileAudio;
        if (videoExtensions.includes(p.extension)) return FileVideo;
        if (spreadsheetExtensions.includes(p.extension)) return FileSpreadsheet;
        if (presentationExtensions.includes(p.extension)) return Presentation;
        return File;
      })();

  return <FileComp size={p.size ? p.size : 40} />;
}
