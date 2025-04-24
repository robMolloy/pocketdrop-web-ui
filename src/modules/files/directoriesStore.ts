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

export type TDirectoryTree = TDirectory & { children: TDirectoryTree[]; fullPath: string };

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

type TDirectoryWithFullPath = TDirectory & { fullPath: string };

function buildDirectoriesWithFullPaths(directories: TDirectory[]): TDirectoryWithFullPath[] {
  // Create a map for quick lookups
  const dirMap = new Map<string, TDirectory>();
  directories.forEach((dir) => dirMap.set(dir.id, dir));

  return directories.map((dir) => {
    // If there's no relation, fullPath is just the directory name
    if (!dir.directoryRelationId) {
      return { ...dir, fullPath: "/" + dir.name };
    }

    // Build the full path by traversing the directory relations
    const pathParts: string[] = [dir.name];
    let currentDir = dir;

    // Follow the relation chain until we reach a directory with no relation
    while (currentDir.directoryRelationId && dirMap.has(currentDir.directoryRelationId)) {
      const parent = dirMap.get(currentDir.directoryRelationId)!;
      pathParts.unshift(parent.name);
      currentDir = parent;
    }

    return { ...dir, fullPath: "/" + pathParts.join("/") };
  });
}

function traverseDirectoryTree(
  dirTree: TDirectoryTree,
  onEachDirTree: (x: TDirectoryTree) => void,
): void {
  onEachDirTree(dirTree);

  for (const child of dirTree.children) traverseDirectoryTree(child, onEachDirTree);
}
function buildDirectoriesWithFullPathsFromDirectoryTree(
  tree: TDirectoryTree,
): TDirectoryWithFullPath[] {
  const result: TDirectoryWithFullPath[] = [];

  traverseDirectoryTree(tree, (x) => {
    const { children: _, ...rest } = x;
    result.push(rest);
  });

  return result;
}

export const useDirectoryTreeStore = () => {
  const directoriesStore = useDirectoriesStore();

  if (!directoriesStore.data) return { tree: undefined, data: undefined } as const;

  const tree = convertDirectoriesIntoDirectoryTree(directoriesStore.data);
  const data = buildDirectoriesWithFullPaths(directoriesStore.data);
  const data2 = buildDirectoriesWithFullPathsFromDirectoryTree(tree);

  return { tree, data, data2 };
};
