import type { FileItem } from "../lib/types";

// Returns a new tree with `path` added (intermediate folders created as needed).
// An existing file at `path` gets its content replaced.
export function insertPath(
  tree: FileItem[],
  path: string,
  type: "file" | "folder",
  content?: string,
  prefix = ""
): FileItem[] {
  const [name, ...rest] = path.split("/").filter(Boolean);
  if (!name) return tree;

  const nodePath = prefix ? `${prefix}/${name}` : name;
  const isLeaf = rest.length === 0;
  const nodeType = isLeaf ? type : "folder";
  const existing = tree.find((n) => n.name === name);

  if (existing && existing.type !== nodeType) {
    console.error(`Path conflict: ${nodePath} already exists as a ${existing.type}`);
    return tree;
  }

  const node: FileItem = existing ?? {
    name,
    type: nodeType,
    path: nodePath,
    children: nodeType === "folder" ? [] : undefined,
  };
  const updated: FileItem =
    nodeType === "file"
      ? { ...node, content: content ?? "" }
      : isLeaf
      ? node
      : { ...node, children: insertPath(node.children ?? [], rest.join("/"), type, content, nodePath) };

  return existing ? tree.map((n) => (n === existing ? updated : n)) : [...tree, updated];
}

export function updateFileContent(tree: FileItem[], path: string, content: string): FileItem[] {
  return tree.map((item) => {
    if (item.path === path) return { ...item, content };
    if (item.children) return { ...item, children: updateFileContent(item.children, path, content) };
    return item;
  });
}
