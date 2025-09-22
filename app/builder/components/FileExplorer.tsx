import ExplorerItem from './ExplorerItem';
import { FileTree } from '../../lib/types';

interface FileExplorerProps {
  files: FileTree;
  onFileSelect: (path: string) => void;
}

export default function FileExplorer({ files, onFileSelect }: FileExplorerProps) {
  return (
    <div className="p-2 bg-transparent text-white h-full">
      {Object.entries(files).map(([name, node]) => (
        <ExplorerItem
          key={name}
          name={name}
          path={name}
          node={node}
          onFileSelect={onFileSelect}
        />
      ))}
    </div>
  );
}