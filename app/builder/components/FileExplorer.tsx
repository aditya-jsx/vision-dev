"use client"

import React, { useState } from 'react';
import { Folder, FolderOpen, FileCode2, FileJson, FileText, File, ChevronRight } from 'lucide-react';
import { FileItem } from "../../lib/types";

function FileIcon({ name }: { name: string }) {
    const ext = name.split('.').pop()?.toLowerCase();
    if (['ts', 'tsx', 'js', 'jsx'].includes(ext || '')) return <FileCode2 className="w-4 h-4 shrink-0 text-sky-400" />;
    if (ext === 'json') return <FileJson className="w-4 h-4 shrink-0 text-amber-300" />;
    if (ext === 'md') return <FileText className="w-4 h-4 shrink-0 text-zinc-400" />;
    if (ext === 'css' || ext === 'html') return <FileCode2 className="w-4 h-4 shrink-0 text-pink-400" />;
    return <File className="w-4 h-4 shrink-0 text-zinc-500" />;
}

// Helper component to render each node (file or folder) in the tree.
function FileNode({ item, depth, onFileClick, selectedPath }: { item: FileItem; depth: number; onFileClick: (file: FileItem) => void; selectedPath?: string; }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const isSelected = item.path === selectedPath;

    const handleClick = () => {
        if (item.type === 'folder') {
            setIsExpanded(!isExpanded);
        } else {
            onFileClick(item);
        }
    };

    return (
        <div className="select-none text-[13px]">
            <div
                className={`relative flex items-center gap-1.5 py-1 pr-2 rounded-md cursor-pointer transition-colors ${isSelected ? 'bg-indigo-500/15 text-white' : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'}`}
                style={{ paddingLeft: `${depth * 0.875 + 0.5}rem` }}
                onClick={handleClick}
            >
                {isSelected && <span className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-indigo-400" />}
                {item.type === 'folder' ? (
                    <>
                        <ChevronRight className={`w-3.5 h-3.5 shrink-0 text-zinc-600 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                        {isExpanded
                            ? <FolderOpen className="w-4 h-4 shrink-0 text-indigo-300" />
                            : <Folder className="w-4 h-4 shrink-0 text-indigo-300" />}
                    </>
                ) : (
                    <span className="ml-5"><FileIcon name={item.name} /></span>
                )}
                <span className="truncate">{item.name}</span>
            </div>
            {item.type === 'folder' && isExpanded && item.children && (
                <div>
                    {item.children.map((child) => (
                        <FileNode key={child.path} item={child} depth={depth + 1} onFileClick={onFileClick} selectedPath={selectedPath} />
                    ))}
                </div>
            )}
        </div>
    );
}

export function FileExplorer({ files = [], onFileSelect, selectedPath }: { files: FileItem[]; onFileSelect: (file: FileItem) => void; selectedPath?: string; }) {
    return (
        <div className="h-full w-full text-white flex flex-col overflow-hidden bg-transparent">
            <div className="flex h-9 items-center px-4 flex-shrink-0">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">Explorer</h3>
            </div>
            <div className="flex-1 w-full px-1.5 pb-2 overflow-y-auto space-y-px no-scrollbar">
                {files.length === 0 && (
                    <div className="space-y-2 px-2 pt-1">
                        {[70, 55, 80, 45, 60].map((w, i) => (
                            <div key={i} className="h-3 animate-pulse rounded bg-white/[0.04]" style={{ width: `${w}%`, animationDelay: `${i * 120}ms` }} />
                        ))}
                    </div>
                )}
                {files.map((file) => (
                    <FileNode key={file.path} item={file} depth={0} onFileClick={onFileSelect} selectedPath={selectedPath} />
                ))}
            </div>
        </div>
    );
}
