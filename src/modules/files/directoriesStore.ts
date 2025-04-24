import { create } from "zustand";
import { TDirectory } from "../directories/dbDirectoriesUtils";

type TState = TDirectory[] | undefined;

export const useDirectoriesStore = create<{
  data: TState;
  setData: (x: TState) => void;
  clear: () => void;
}>()((set) => ({
  data: [],
  setData: (data) => set(() => ({ data })),
  clear: () => set(() => ({ data: undefined })),
}));

type TDirectoryTree = TDirectory & { children: TDirectoryTree[]; fullPath: string };

const convertDirectoriesIntoDirectoryTree = (directories: TDirectory[]): TDirectoryTree[] => {
  // Create a map of all directories by their ID
  const directoryMap = new Map<string, TDirectory>();
  directories.forEach((dir) => directoryMap.set(dir.id, dir));

  // Create a map to store the tree structure
  const treeMap = new Map<string, TDirectoryTree>();

  // Helper function to build full path recursively
  const buildFullPath = (dir: TDirectory, path: string = ""): string => {
    if (!dir.directoryRelationId) {
      return dir.name;
    }
    const parent = directoryMap.get(dir.directoryRelationId);
    if (!parent) {
      return dir.name;
    }
    return `${buildFullPath(parent)}/${dir.name}`;
  };

  // Initialize the tree structure
  directories.forEach((dir) => {
    treeMap.set(dir.id, {
      ...dir,
      fullPath: buildFullPath(dir),
      children: [],
    });
  });

  // Build the tree by linking children to their parents
  directories.forEach((dir) => {
    if (dir.directoryRelationId) {
      const parent = treeMap.get(dir.directoryRelationId);
      if (parent) {
        const child = treeMap.get(dir.id);
        if (child) {
          parent.children.push(child);
        }
      }
    }
  });

  // Find root nodes (directories without parents)
  return directories
    .filter((dir) => !dir.directoryRelationId)
    .map((dir) => treeMap.get(dir.id))
    .filter((node): node is NonNullable<typeof node> => node !== undefined);
};

export const useDirectoryTreeStore = () => {
  const directoriesStore = useDirectoriesStore();

  if (!directoriesStore.data) return { data: undefined } as const;

  const tree = convertDirectoriesIntoDirectoryTree(directoriesStore.data);

  return tree;
};
