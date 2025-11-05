"use client"

import React from 'react';
import Editor from '@monaco-editor/react';
import { FileItem } from '../../lib/types';
import Loader from '../../components/Loader';

// A simple helper function to determine the language for syntax highlighting
const getLanguageFromPath = (path: string): string => {
    const extension = path.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'js':
        case 'jsx':
            return 'javascript';
        case 'ts':
        case 'tsx':
            return 'typescript';
        case 'css':
            return 'css';
        case 'json':
            return 'json';
        case 'html':
            return 'html';
        case 'md':
            return 'markdown';
        default:
            return 'plaintext';
    }
};

export function CodeEditor({ file }: { file: FileItem | null }) {
    if (!file) {
        return (
            <div className="h-full flex items-center justify-center text-zinc-400">
                Select a file to view its contents
            </div>
        );
    }

    const language = getLanguageFromPath(file.path);

    return (
        <Editor
            height="100%"
            language={language}
            theme="vs-dark"
            value={file.content || ''}
            loading={<Loader />}
            options={{
                readOnly: true, // false to allow editing
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: 'on',
                scrollBeyondLastLine: false,
                contextmenu: false,
            }}
        />
    );
}
