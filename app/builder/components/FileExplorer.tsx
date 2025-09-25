// //! File Explorer

// "use client"

// import React, { useState } from 'react';
// import { FolderTree, File, ChevronRight, ChevronDown } from 'lucide-react';
// import { FileItem } from '../../lib/types';

// // This is a helper component to render each node in the file tree
// function FileNode({ item, depth, onFileClick }: { item: FileItem; depth: number; onFileClick: (file: FileItem) => void; }) {
//     const [isExpanded, setIsExpanded] = useState(true); // Folders start expanded

//     const handleClick = () => {
//         if (item.type === 'folder') {
//             setIsExpanded(!isExpanded);
//         } else {
//             onFileClick(item);
//         }
//     };

//     return (
//         <div className="select-none text-sm">
//             <div
//                 className="flex items-center gap-2 py-1 px-2 hover:bg-zinc-800 rounded-md cursor-pointer"
//                 style={{ paddingLeft: `${depth * 1.25}rem` }}
//                 onClick={handleClick}
//             >
//                 {/* Render expand/collapse icon for folders */}
//                 {item.type === 'folder' && (
//                     <span className="text-zinc-400">
//                         {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
//                     </span>
//                 )}
                
//                 {/* Render folder or file icon and name */}
//                 {item.type === 'folder'
//                     ? <FolderTree className="w-4 h-4 text-blue-400" />
//                     // Add margin for file icons to align them
//                     : <File className="w-4 h-4 text-zinc-400 ml-5" />
//                 }
//                 <span className="text-zinc-200">{item.name}</span>
//             </div>
            
//             {/* Recursively render children if the folder is expanded */}
//             {item.type === 'folder' && isExpanded && item.children && (
//                 <div>
//                     {item.children.map((child) => (
//                         <FileNode key={child.path} item={child} depth={depth + 1} onFileClick={onFileClick} />
//                     ))}
//                 </div>
//             )}
//         </div>
//     );
// }

// // This is the main component for the file explorer pane
// export default function FileExplorer({ files, onFileSelect }: { files: FileItem[]; onFileSelect: (file: FileItem) => void; }) {
//     return (
//         <div className="h-full w-full text-white flex flex-col overflow-hidden bg-zinc-900 rounded-xl border border-gray-700">
//             <div className="w-full text-white p-3 border-b border-zinc-700 flex-shrink-0">
//                 <h3 className="font-semibold text-lg">File Explorer</h3>
//             </div>
//             <div className="flex-1 w-full p-2 overflow-y-auto space-y-1">
//                 {files.map((file) => (
//                     <FileNode key={file.path} item={file} depth={0} onFileClick={onFileSelect} />
//                 ))}
//             </div>
//         </div>
//     );
// }



















"use client"

import React, { useState } from 'react';
import { FolderTree, File, ChevronRight, ChevronDown } from 'lucide-react';
import { FileItem } from '../../lib/types';

// Helper component to render each node (file or folder) in the tree.
function FileNode({ item, depth, onFileClick }: { item: FileItem; depth: number; onFileClick: (file: FileItem) => void; }) {
    const [isExpanded, setIsExpanded] = useState(true);

    const handleClick = () => {
        if (item.type === 'folder') {
            setIsExpanded(!isExpanded);
        } else {
            onFileClick(item);
        }
    };

    return (
        <div className="select-none text-sm">
            <div
                className="flex items-center gap-2 py-1 px-2 hover:bg-zinc-800 rounded-md cursor-pointer"
                style={{ paddingLeft: `${depth * 1.25}rem` }}
                onClick={handleClick}
            >
                {item.type === 'folder' && (
                    <span className="text-zinc-400">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </span>
                )}
                {item.type === 'folder'
                    ? <FolderTree className="w-4 h-4 text-blue-400" />
                    : <File className="w-4 h-4 text-zinc-400 ml-5" />
                }
                <span className="text-zinc-200">{item.name}</span>
            </div>
            {item.type === 'folder' && isExpanded && item.children && (
                <div>
                    {item.children.map((child) => (
                        <FileNode key={child.path} item={child} depth={depth + 1} onFileClick={onFileClick} />
                    ))}
                </div>
            )}
        </div>
    );
}

// Main component for the file explorer pane.
// **FIX:** Added a default value `[]` to the files prop to prevent the crash.
export function FileExplorer({ files = [], onFileSelect }: { files: FileItem[]; onFileSelect: (file: FileItem) => void; }) {
    return (
        <div className="h-full w-full text-white flex flex-col overflow-hidden bg-transparent rounded-xl border border-gray-700">
            <div className="w-full text-white p-3 border-b border-zinc-700 flex-shrink-0">
                <h3 className="font-semibold text-lg">File Explorer</h3>
            </div>
            <div className="flex-1 w-full p-2 overflow-y-auto space-y-1">
                {/* This map is now safe because `files` is guaranteed to be an array */}
                {files.map((file) => (
                    <FileNode key={file.path} item={file} depth={0} onFileClick={onFileSelect} />
                ))}
            </div>
        </div>
    );
}
