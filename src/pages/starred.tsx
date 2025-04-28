import { useDirectoryTreeStore } from "@/modules/files/directoriesStore";
import { DisplayFilesTableView } from "@/modules/files/DisplayFilesTableView";
import { useFilesStore } from "@/modules/files/filesStore";

const StarredPage = () => {
  const filesStore = useFilesStore();
  const starredFiles = filesStore.data?.filter((file) => file.isStarred) ?? [];
  const directoriesStore = useDirectoryTreeStore();
  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold">Starred Files</h1>

      <DisplayFilesTableView
        files={starredFiles}
        parentDirectories={directoriesStore.fullPaths ?? []}
      />
    </div>
  );
};

export default StarredPage;
