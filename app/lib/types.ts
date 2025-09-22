export type FileNode = string | FileTree;

export interface FileTree {
  [key: string]: FileNode;
}