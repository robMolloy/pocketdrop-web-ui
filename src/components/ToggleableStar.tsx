import { Star } from "lucide-react";
import { Button } from "./ui/button";
import { TFileRecord, updateFile } from "@/modules/files/dbFilesUtils";
import { useEffect, useState } from "react";
import { pb } from "@/config/pocketbaseConfig";

export function ToggleableStar(p: { file: TFileRecord; size?: "sm" | "md" | "lg" }) {
  const size = p.size ?? "md";
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  const iconSize = {
    sm: "h-3 w-3",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const [isStarred, setIsStarred] = useState(p.file.isStarred);

  useEffect(() => {
    setIsStarred(p.file.isStarred);
  }, [p.file.isStarred]);

  return (
    <Button
      variant="ghost"
      size="icon"
      className={sizeClasses[size]}
      onClick={async () => {
        const newIsStarred = !isStarred;
        setIsStarred(newIsStarred);
        await updateFile({ pb, data: { ...p.file, isStarred: newIsStarred } });
      }}
      title={isStarred ? "Unstar" : "Star"}
    >
      <Star
        className={`${iconSize[size]} ${isStarred ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
      />
    </Button>
  );
}
