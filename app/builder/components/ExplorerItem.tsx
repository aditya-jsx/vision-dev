import { useState } from 'react';
import { Folder, FileText, ChevronRight, ChevronDown } from 'lucide-react';
import { FileNode } from '../../lib/types';

interface ExplorerItemProps {
  name: string;
  path: string;
  node: FileNode;
  onFileSelect: (path: string) => void;
}

export default function ExplorerItem({ name, path, node, onFileSelect }: ExplorerItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isFolder = typeof node === 'object';

  const handleToggle = () => {
    if (isFolder) {
      setIsOpen(!isOpen);
    } else {
      onFileSelect(path);
    }
  };

  return (
    <div className="text-sm">
      <div
        onClick={handleToggle}
        className="flex items-center cursor-pointer p-1 rounded hover:bg-gray-900"
      >
        {isFolder ? (
          <>
            {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <Folder size={16} className="ml-1 mr-2 text-blue-400" />
          </>
        ) : (
          <FileText size={16} className="ml-1 mr-2 text-gray-400" />
        )}
        <span>{name}</span>
      </div>

      {isFolder && isOpen && (
        <div className="pl-4 border-l border-gray-600 ml-2">
          {Object.entries(node).map(([childName, childNode]) => (
            <ExplorerItem
              key={childName}
              name={childName}
              path={`${path}/${childName}`}
              node={childNode}
              onFileSelect={onFileSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}