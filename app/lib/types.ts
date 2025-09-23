export type FileNode = string | FileTree;

export interface FileTree {
  [key: string]: FileNode;
}


// export enum StepType {
//   CreateFile,
//   CreateFolder,
//   EditFile,
//   DeleteFile,
//   RunScript
// }

// export interface Step {
//   id: number;
//   title: string;
//   description: string;
//   type: StepType;
//   status: 'pending' | 'in-progress' | 'completed';
//   code?: string;
//   path?: string;
// }

// export interface Project {
//   prompt: string;
//   steps: Step[];
// }

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



export const StepType = {
    CreateFolder: 'CreateFolder',
    CreateFile: 'CreateFile',
    RunScript: 'RunScript',
};

export type StepStatus = "pending" | "in-progress" | "completed" | "failed";

export interface AppStep {
    id: number;
    title: string;
    description: string;
    type: string;
    status: StepStatus;
    code?: string;
    path?: string;
}