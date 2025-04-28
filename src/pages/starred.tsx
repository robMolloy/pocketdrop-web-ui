import { DisplayFilesTableView } from "@/modules/files/DisplayFilesTableView";
import { useFilesStore } from "@/modules/files/filesStore";

const StarredPage = () => {
  const filesStore = useFilesStore();
  const starredFiles = filesStore.data?.filter((file) => file.isStarred) ?? [];

  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold">Starred Files</h1>

      <DisplayFilesTableView files={starredFiles} />
    </div>
  );
};

export default StarredPage;
