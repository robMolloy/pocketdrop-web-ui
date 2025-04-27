import { useBrowsePath } from "@/components/FileTree";
import { useDirectoryTreeStore } from "@/modules/files/directoriesStore";
import { BrowseScreen } from "@/screens/BrowseScreen";

const Index = () => {
  const directoryTreeStore = useDirectoryTreeStore();
  const browsePath = useBrowsePath().browsePath as string;

  const currentDirectory = directoryTreeStore.fullPaths?.find((x) => x.fullPath === browsePath);
  return <BrowseScreen browsePath="/" directoryId={currentDirectory?.id} />;
};

export default Index;
