import { useBrowsePath } from "@/components/FileTree";
import { BrowseScreen } from "@/screens/BrowseScreen";

export default function BrowsePage() {
  const browsePath = useBrowsePath().browsePath as string;

  return <BrowseScreen browsePath={browsePath} />;
}
