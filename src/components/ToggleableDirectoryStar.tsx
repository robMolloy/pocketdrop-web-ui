import { Star } from "lucide-react";
import { Button } from "./ui/button";
import { TDirectoryWithFullPath } from "@/modules/files/directoriesStore";
import { useEffect, useState } from "react";
import { pb } from "@/config/pocketbaseConfig";
import { updateDirectory } from "@/modules/directories/dbDirectoriesUtils";

export function ToggleableDirectoryStar(p: {
  directory: TDirectoryWithFullPath;
  size?: "sm" | "md" | "lg";
}) {
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

  const [isStarred, setIsStarred] = useState(p.directory.isStarred);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsStarred(p.directory.isStarred);
  }, [p.directory.isStarred]);

  return (
    <Button
      variant="ghost"
      size="icon"
      className={sizeClasses[size]}
      onClick={async (e) => {
        e.stopPropagation();

        if (isLoading) return;
        setIsLoading(true);

        const newIsStarred = !isStarred;
        setIsStarred(newIsStarred);
        const resp = await updateDirectory({
          pb,
          data: { ...p.directory, isStarred: newIsStarred },
        });
        setIsLoading(false);
        if (!resp.success) setIsStarred(!newIsStarred);
      }}
      disabled={isLoading}
      title={isStarred ? "Unstar" : "Star"}
    >
      <Star
        className={`${iconSize[size]} ${isStarred ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
      />
    </Button>
  );
}
