import { Button } from "@/components/ui/button";
import { useViewTypeStore } from "../viewTypeStore";
import { Grid, List } from "lucide-react";

export const ViewTypeToggleButton = () => {
  const viewTypeStore = useViewTypeStore();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => viewTypeStore.toggle()}
      title={viewTypeStore.data === "icon" ? "Switch to list view" : "Switch to icon view"}
    >
      {(() => {
        const Icon = viewTypeStore.data === "table" ? List : Grid;
        return <Icon size={20} />;
      })()}
      View
    </Button>
  );
};
