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
  // Create root node
  const rootNode: TDirectoryTree = {
    id: "root",
    name: "/",
    collectionId: "",
    collectionName: "directories",
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    directoryRelationId: "",
    fullPath: "/",
    children: [],
  };

  // Helper function to recursively build tree
  const buildTree = (parentNode: TDirectoryTree, parentId: string) => {
    // Find all directories that have this parent's ID as their directoryRelationId
    const children = directories.filter((dir) => dir.directoryRelationId === parentId);

    // For each child directory
    children.forEach((child) => {
      // Create child node with full path
      const childNode: TDirectoryTree = {
        ...child,
        fullPath: `${parentNode.fullPath}${child.name}/`,
        children: [],
      };

      // Add child to parent's children array
      parentNode.children.push(childNode);

      // Recursively build tree for this child
      buildTree(childNode, child.id);
    });
  };

  // Start building tree from root
  buildTree(rootNode, "");

  // Return array with just the root node
  return [rootNode];
};

export const useDirectoryTreeStore = () => {
  const directoriesStore = useDirectoriesStore();

  if (!directoriesStore.data) return { data: undefined } as const;

  const tree = convertDirectoriesIntoDirectoryTree(directoriesStore.data);

  return tree;
};
