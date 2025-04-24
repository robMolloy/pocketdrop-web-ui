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

const buildTree = (p: {
  parentNode: TDirectoryTree;
  allDirectories: TDirectory[];
  parentId: string;
}) => {
  const children = p.allDirectories.filter((dir) => dir.directoryRelationId === p.parentId);

  children.forEach((child) => {
    const childNode: TDirectoryTree = {
      ...child,
      fullPath: `${p.parentNode.fullPath}${child.name}/`,
      children: [],
    };

    p.parentNode.children.push(childNode);

    buildTree({ parentNode: childNode, allDirectories: p.allDirectories, parentId: child.id });
  });
};

const convertDirectoriesIntoDirectoryTree = (directories: TDirectory[]): TDirectoryTree => {
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

  buildTree({
    parentNode: rootNode,
    allDirectories: directories,
    parentId: "",
  });

  return rootNode;
};

export const useDirectoryTreeStore = () => {
  const directoriesStore = useDirectoriesStore();

  if (!directoriesStore.data) return { data: undefined } as const;

  return { data: convertDirectoriesIntoDirectoryTree(directoriesStore.data) };
};
