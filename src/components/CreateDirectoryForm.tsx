import { useState } from "react";
import { Button } from "./ui/button";
import { createFile } from "@/modules/files/dbFilesUtils";
import { pb } from "@/config/pocketbaseConfig";

export function CreateDirectoryForm(p: { onSuccess: () => void; currentPath: string }) {
  const [directoryName, setDirectoryName] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <form className="w-full">
      <div className="space-y-3">
        {error && <div className="text-center text-sm text-destructive">{error}</div>}

        <div className="space-y-1">
          <label htmlFor="directoryName" className="text-xs text-muted-foreground">
            Directory name
          </label>
          <input
            id="directoryName"
            type="text"
            value={directoryName}
            onChange={(e) => setDirectoryName(e.target.value)}
            placeholder="Enter directory name"
            className="w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
            autoFocus
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="submit"
            onClick={async (e) => {
              e.preventDefault();

              if (!directoryName.trim()) return setError("Directory name cannot be empty");
              if (directoryName.includes("/"))
                return setError("Directory name cannot contain slashes");

              const createResp = await createFile({
                pb,
                data: {
                  filePath: `${p.currentPath}${p.currentPath.slice(-1) === "/" ? "" : "/"}${directoryName}/`,
                },
              });

              if (!createResp.success) return setError("Error creating directory");
              p.onSuccess();
            }}
            className="rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground hover:bg-primary/90"
          >
            Create
          </Button>
        </div>
      </div>
    </form>
  );
}
