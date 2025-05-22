import { useFilesStore } from "@/modules/files/filesStore";

export default () => {
  const filesStore = useFilesStore();
  return (
    <div>
      <pre>{JSON.stringify(filesStore, undefined, 2)}</pre>
    </div>
  );
};
