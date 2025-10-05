export type FileNode = string | FileTree;

export interface FileTree {
  [key: string]: FileNode;
}

export interface FileItem {
  name: string;
  type: 'file' | 'folder';
  children?: FileItem[];
  content?: string;
  path: string;
}

export interface FileViewerProps {
  file: FileItem | null;
  onClose: () => void;
}

export enum StepType {
  CreateFile,
  CreateFolder,
  EditFile,
  DeleteFile,
  RunScript,
}

// The structure of a single step object.
export interface Step {
  id: number;
  title: string;
  description: string;
  type: StepType;
  status: 'pending' | 'in-progress' | 'completed';
  code?: string;
  path?: string;
}

// The structure for an item in the file explorer (can be a file or a folder).
export interface FileItem {
  name: string;
  type: 'file' | 'folder';
  path: string;
  content?: string;
  children?: FileItem[];
}