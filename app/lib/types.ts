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

export interface Step {
  id: number;
  title: string;
  description: string;
  type: StepType;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  code?: string;
  path?: string;
}

// export interface FileItem {
//   name: string;
//   type: 'file' | 'folder';
//   path: string;
//   content?: string;
//   children?: FileItem[];
// }