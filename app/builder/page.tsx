"use client"

import { useState } from "react";
import CodeEditor from "./components/CodeEditor";
import FileExplorer from "./components/FileExplorer";
import { FileNode, FileTree } from "../lib/types";

const initialFiles: FileTree = {
  'src': {
    'components': {
      'Header.tsx': 'export default function Header() { return <h1>Header</h1>; }',
      'Footer.tsx': 'export default function Footer() { return <footer>Footer Content</footer>; }',
    },
    'App.tsx': 'import Header from "./components/Header";\nimport Footer from "./components/Footer";\n\nexport default function App() {\n  return (\n    <div>\n      <Header />\n      <main>Page Content</main>\n      <Footer />\n    </div>\n  );\n}',
    'index.css': 'body { margin: 0; }',
  },
  'package.json': '{ "name": "my-ide-app" }',
};

const getFileContent = (tree: FileTree, path: string): string => {
    const parts = path.split('/');
    let currentNode: FileNode = tree;
    for (const part of parts) {
        if (typeof currentNode !== 'object' || !currentNode[part]) {
            return `// File not found: ${path}`;
        }
        currentNode = currentNode[part];
    }
    return typeof currentNode === 'string' ? currentNode : `// Not a file: ${path}`;
};

const updateFileContent = (tree: FileTree, path: string, newContent: string): FileTree => {
    const parts = path.split('/');
    const newTree = JSON.parse(JSON.stringify(tree)); // Deep copy for immutability
    let currentNode: any = newTree;

    for (let i = 0; i < parts.length - 1; i++) {
        currentNode = currentNode[parts[i]];
    }

    currentNode[parts[parts.length - 1]] = newContent;
    return newTree;
};

export default function Builder(){

  const [files, setFiles] = useState<FileTree>(initialFiles);
  const [activeFile, setActiveFile] = useState<string>('');

  return(
    <div className="h-screen w-full bg-zinc-950 flex flex-col items-center justify-center">

      {/* Navbar */}
      <div className="h-[7%] w-full border-b border-green-600"></div>

      {/* Builder Area */}
      <div className="h-[94%] w-full flex px-2 py-3 gap-2">

        {/* Ai chat */}
        <div className="h-full w-[30%] border-1 border-red-600  rounded-xl"></div>

        {/* Code And Preview */}
        <div className="h-full w-[70%] flex border-1 border-blue-600 rounded-xl">
          {/* File Explorer */}
          <div className="h-full w-[30%] border-r border-white">
            <FileExplorer />
          </div>

          {/* Code Editor / Preview */}
          <div className="h-full w-[70%] border-l border-white rounded-2xl">
            <CodeEditor />
          </div>
        </div>

      </div>

    </div>
  )
}