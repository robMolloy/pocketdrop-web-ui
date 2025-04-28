import { ModalContent } from "@/components/Modal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TDirectoryWithFullPath } from "@/modules/files/directoriesStore";
import { useModalStore } from "@/stores/modalStore";
import { MoreVertical } from "lucide-react";
import { RenameDirectoryForm } from "./RenameDirectoryForm";

export const DirectoryActionsDropdownMenu = (p: { directory: TDirectoryWithFullPath }) => {
  const modalStore = useModalStore();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 text-muted-foreground"
          onClick={async (e) => e.stopPropagation()}
        >
          <MoreVertical className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={async (e) => {
            e.stopPropagation();
            modalStore.setData(
              <ModalContent
                title="Rename"
                description={`Rename ${p.directory.name}`}
                content={
                  <RenameDirectoryForm
                    directory={p.directory}
                    onSuccess={() => modalStore.close()}
                  />
                }
              />,
            );
          }}
        >
          Rename
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
