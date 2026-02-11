"use client"

import React, { useState } from 'react';
import { FolderTree, File, ChevronRight, ChevronDown } from 'lucide-react';
import { FileItem } from "../../lib/types";

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






export function FileExplorer({ files = [], onFileSelect }: { files: FileItem[]; onFileSelect: (file: FileItem) => void; }) {
    return (
        <div className="h-full w-full text-white flex flex-col overflow-hidden bg-transparent">
            <div className="w-full text-white p-3 border-b border-zinc-700 flex-shrink-0">
                <h3 className="font-semibold text-lg">File Explorer</h3>
            </div>
            <div className="flex-1 w-full p-2 overflow-y-auto space-y-1 no-scrollbar">
                {files.map((file) => (
                    <FileNode key={file.path} item={file} depth={0} onFileClick={onFileSelect} />
                ))}
            </div>
        </div>
    );
}