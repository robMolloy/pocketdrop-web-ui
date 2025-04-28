import { pb } from "@/config/pocketbaseConfig";
import { updateDirectory } from "@/modules/directories/dbDirectoriesUtils";
import { TDirectoryWithFullPath } from "@/modules/files/directoriesStore";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function RenameDirectoryForm(p: {
  directory: TDirectoryWithFullPath;
  onSuccess: () => void;
}) {
  const [directoryName, setDirectoryName] = useState(p.directory.name);
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

              const updateDirResp = await updateDirectory({
                pb,
                data: {
                  ...p.directory,
                  name: directoryName,
                },
              });

              if (!updateDirResp.success) return setError("Error renaming directory");
              p.onSuccess();
            }}
            className="rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground hover:bg-primary/90"
          >
            Rename
          </Button>
        </div>
      </div>
    </form>
  );
}
