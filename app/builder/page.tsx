// "use client"

// import { useState } from "react";
// import CodeEditor from "./components/CodeEditor";
// import FileExplorer from "./components/FileExplorer";
// import { FileNode, FileTree } from "../lib/types";

// const initialFiles: FileTree = {
//   'src': {
//     'components': {
//       'Header.tsx': 'export default function Header() { return <h1>Header</h1>; }',
//       'Footer.tsx': 'export default function Footer() { return <footer>Footer Content</footer>; }',
//     },
//     'App.tsx': 'import Header from "./components/Header";\nimport Footer from "./components/Footer";\n\nexport default function App() {\n  return (\n    <div>\n      <Header />\n      <main>Page Content</main>\n      <Footer />\n    </div>\n  );\n}',
//     'index.css': 'body { margin: 0; }',
//   },
//   'package.json': '{ "name": "my-ide-app" }',
// };

// const getFileContent = (tree: FileTree, path: string): string => {
//     const parts = path.split('/');
//     let currentNode: FileNode = tree;
//     for (const part of parts) {
//         if (typeof currentNode !== 'object' || !currentNode[part]) {
//             return `// File not found: ${path}`;
//         }
//         currentNode = currentNode[part];
//     }
//     return typeof currentNode === 'string' ? currentNode : `// Not a file: ${path}`;
// };

// const updateFileContent = (tree: FileTree, path: string, newContent: string): FileTree => {
//     const parts = path.split('/');
//     const newTree = JSON.parse(JSON.stringify(tree)); // Deep copy for immutability
//     let currentNode: any = newTree;

//     for (let i = 0; i < parts.length - 1; i++) {
//         currentNode = currentNode[parts[i]];
//     }

//     currentNode[parts[parts.length - 1]] = newContent;
//     return newTree;
// };

// export default function Builder(){

//   const [files, setFiles] = useState<FileTree>(initialFiles);
//   const [activeFile, setActiveFile] = useState<string>('');

//   return(
//     <div className="h-screen w-full bg-zinc-950 flex flex-col items-center justify-center">

//       {/* Navbar */}
//       <div className="h-[7%] w-full border-b border-green-600"></div>

//       {/* Builder Area */}
//       <div className="h-[94%] w-full flex px-2 py-3 gap-2">

//         {/* Ai chat */}
//         <div className="h-full w-[30%] border-1 border-red-600  rounded-xl"></div>

//         {/* Code And Preview */}
//         <div className="h-full w-[70%] flex border-1 border-blue-600 rounded-xl">
//           {/* File Explorer */}
//           <div className="h-full w-[30%] border-r border-white">
//             <FileExplorer />
//           </div>

//           {/* Code Editor / Preview */}
//           <div className="h-full w-[70%] border-l border-white rounded-2xl">
//             <CodeEditor />
//           </div>
//         </div>

//       </div>

//     </div>
//   )
// }








// "use client"

// import { useState } from "react";
// import CodeEditor from "./components/CodeEditor";
// import FileExplorer from "./components/FileExplorer";
// import { FileTree, FileNode } from "../lib/types";

// const initialFiles: FileTree = {
//   'src': {
//     'components': {
//       'Header.tsx': 'export default function Header() { return <h1>Header</h1>; }',
//       'Footer.tsx': 'export default function Footer() { return <footer>Footer Content</footer>; }',
//     },
//     'App.tsx': 'import Header from "./components/Header";\nimport Footer from "./components/Footer";\n\nexport default function App() {\n  return (\n    <div>\n      <Header />\n      <main>Page Content</main>\n      <Footer />\n    </div>\n  );\n}',
//     'index.css': 'body { margin: 0; }',
//   },
//   'package.json': '{ "name": "my-ide-app" }',
// };

// // Helper to get content from a nested path
// const getFileContent = (tree: FileTree, path: string): string => {
//     const parts = path.split('/');
//     let currentNode: FileNode = tree;
//     for (const part of parts) {
//         if (typeof currentNode !== 'object' || !currentNode[part]) {
//             return `// File not found: ${path}`;
//         }
//         currentNode = currentNode[part];
//     }
//     return typeof currentNode === 'string' ? currentNode : `// Not a file: ${path}`;
// };

// // Helper to update content at a nested path
// const updateFileContent = (tree: FileTree, path: string, newContent: string): FileTree => {
//     const parts = path.split('/');
//     const newTree = JSON.parse(JSON.stringify(tree)); // Deep copy for immutability
//     let currentNode: any = newTree;

//     for (let i = 0; i < parts.length - 1; i++) {
//         currentNode = currentNode[parts[i]];
//     }

//     currentNode[parts[parts.length - 1]] = newContent;
//     return newTree;
// };


// export default function Builder(){

//   const [files, setFiles] = useState<FileTree>(initialFiles);
//   const [activeFile, setActiveFile] = useState<string>('src/App.tsx'); // Set a default active file

//   const handleFileSelect = (path: string) => {
//     setActiveFile(path);
//   };

//   const handleCodeChange = (newCode: string) => {
//     if (activeFile) {
//       setFiles(prevFiles => updateFileContent(prevFiles, activeFile, newCode));
//     }
//   };

//   return(
//     <div className="h-screen w-full bg-zinc-950 flex flex-col items-center justify-center">

//       {/* Navbar */}
//       <div className="h-[7%] w-full border-b border-gray-700"></div>

//       {/* Builder Area */}
//       <div className="h-[93%] w-full flex px-2 py-3 gap-2">

//         {/* Ai chat */}
//         <div className="h-full w-[30%] border border-gray-700 rounded-xl"></div>

//         {/* Code And Preview */}
//         <div className="h-full w-[70%] flex border border-gray-700 rounded-xl">
//           {/* File Explorer */}
//           <div className="h-full w-[30%] border-r border-gray-700">
//             <FileExplorer files={files} onFileSelect={handleFileSelect} />
//           </div>

//           {/* Code Editor / Preview */}
//           <div className="h-full w-[70%] z-2">
//             <CodeEditor
//               value={getFileContent(files, activeFile)}
//               onChange={(value) => handleCodeChange(value || '')}
//             />
//           </div>
//         </div>

//       </div>

//     </div>
//   )
// }
























// "use client"

// import { useEffect, useState } from "react";
// import CodeEditor from "./components/CodeEditor";
// import FileExplorer from "./components/FileExplorer";
// import Preview from "./components/Preview";
// import { FileNode, FileTree, Step } from "../lib/types";
// import AIChat from "./components/AIChat";
// import { useSearchParams } from "next/navigation";
// import axios from "axios";
// import { parseXml } from "../utils/parseXml";

// const initialFiles: FileTree = {
//   'src': {
//     'components': {
//       'Header.tsx': 'export default function Header() { return <h1>My Awesome App</h1>; }',
//       'Footer.tsx': 'export default function Footer() { return <footer style={{padding: "1rem", textAlign: "center"}}>Copyright 2025</footer>; }',
//     },
//     'App.tsx': 'import Header from "./components/Header";\nimport Footer from "./components/Footer";\n\nexport default function App() {\n  return (\n    <div>\n      <Header />\n      <main style={{padding: "2rem", minHeight: "80vh"}}>Page Content</main>\n      <Footer />\n    </div>\n  );\n}',
//     'index.css': 'body { margin: 0; font-family: sans-serif; }',
//     'main.tsx': 'import React from "react";\nimport ReactDOM from "react-dom/client";\nimport App from "./App.tsx";\nimport "./index.css";\n\nReactDOM.createRoot(document.getElementById("root")!).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n);',
//   },
//   'index.html': '<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>Preview</title>\n  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="/src/main.tsx"></script>\n  </body>\n</html>',
//   'package.json': '{ "name": "my-ide-app" }',
// };

// const getFileContent = (tree: FileTree, path: string): string => {
//     const parts = path.split('/');
//     let currentNode: FileNode = tree;
//     for (const part of parts) {
//         if (typeof currentNode !== 'object' || !currentNode[part]) {
//             return `// File not found: ${path}`;
//         }
//         currentNode = currentNode[part];
//     }
//     return typeof currentNode === 'string' ? currentNode : `// Not a file: ${path}`;
// };

// const updateFileContent = (tree: FileTree, path: string, newContent: string): FileTree => {
//     const parts = path.split('/');
//     const newTree = JSON.parse(JSON.stringify(tree)); // Deep copy for immutability
//     let currentNode: any = newTree;

//     for (let i = 0; i < parts.length - 1; i++) {
//         currentNode = currentNode[parts[i]];
//     }

//     currentNode[parts[parts.length - 1]] = newContent;
//     return newTree;
// };

// export default function Builder(){

//   const [files, setFiles] = useState<FileTree>(initialFiles);
//   const [activeFile, setActiveFile] = useState<string>('src/App.tsx');
//   const [view, setView] = useState<'editor' | 'preview'>('editor'); // State for the view
//   // const searchParams = useSearchParams();
//   const [initialPrompt, setInitialPrompt] = useState('');

//   const [ steps, setSteps ] = useState<Step[]>([])

//   const BACKEND_URL = process.env.BACKEND_URL;

//   async function init(){
//     const prompt = localStorage.getItem("prompt")

//     const response = await axios.post(`http://localhost:3000/api/skeleton`, {
//       prompt: prompt?.trim()
//     });

//     const { prompts, uiPrompts } = response.data;

//     // setSteps(uiPrompts.map((x:string) => parseXml(x)));
    
//     setSteps(parseXml(uiPrompts[0]).map((x: Step)=>({
//       ...x,
//       status: "completed"
//     })));

//     const steps = await axios.post(`http://localhost:3000/api/chat`, {
//       messages: [...prompts, prompt].map(content => ({
//         role: "user", 
//         parts: [
//           {
//             text: content
//           }
//         ]
//       }))
//     })
//   }

//   useEffect(() => {
//     init();
//   }, []);

//   const handleFileSelect = (path: string) => {
//     setActiveFile(path);
//   };

//   const handleCodeChange = (newCode: string) => {
//     if (activeFile) {
//       setFiles(prevFiles => updateFileContent(prevFiles, activeFile, newCode));
//     }
//   };

//   return(
//     <div className="h-screen w-full bg-zinc-950 flex flex-col items-center justify-center">

//       {/* Navbar */}
//       <div className="h-[7%] w-full border-b border-gray-700 flex items-center justify-end px-4">
//         <button
//           onClick={() => setView(view === 'editor' ? 'preview' : 'editor')}
//           className="bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-600 transition-colors hover:cursor-pointer"
//         >
//           {view === 'editor' ? 'Show Preview' : 'Show Editor'}
//         </button>
//       </div>

//       {/* Builder Area */}
//       <div className="h-[93%] w-full flex px-2 py-3 gap-2">

//         {/* Ai chat */}
//         <div className="h-full w-[30%] border border-gray-700 rounded-xl">
//           {/* <AIChat response={initialPrompt} /> */}


//         </div>

//         {/* Code And Preview */}
//         <div className="h-full w-[70%] flex border border-gray-700 rounded-xl overflow-hidden">
//           {view === 'editor' ? (
//             <>
//               {/* File Explorer */}
//               <div className="h-full w-[30%] border-r border-gray-700">
//                 <FileExplorer files={files} onFileSelect={handleFileSelect} />
//               </div>

//               {/* Code Editor */}
//               <div className="h-full w-[70%]">
//                 <CodeEditor
//                   value={getFileContent(files, activeFile)}
//                   onChange={(value) => handleCodeChange(value || '')}
//                 />
//               </div>
//             </>
//           ) : (
//             // Preview Section
//             <div className="h-full w-full">
//               <Preview files={files} />
//             </div>
//           )}
//         </div>

//       </div>

//     </div>
//   )
// }









































"use client"

import { useEffect, useState } from "react";
import CodeEditor from "./components/CodeEditor";
import FileExplorer from "./components/FileExplorer";
import Preview from "./components/Preview";
import { FileNode, FileTree, Step } from "../lib/types";
import AIChat from "./components/AIChat";
import axios from "axios";
import { parseXml } from "../utils/parseXml";

const initialFiles: FileTree = {
  'src': {
    'components': {
      'Header.tsx': 'export default function Header() { return <h1>My Awesome App</h1>; }',
      'Footer.tsx': 'export default function Footer() { return <footer style={{padding: "1rem", textAlign: "center"}}>Copyright 2025</footer>; }',
    },
    'App.tsx': 'import Header from "./components/Header";\nimport Footer from "./components/Footer";\n\nexport default function App() {\n  return (\n    <div>\n      <Header />\n      <main style={{padding: "2rem", minHeight: "80vh"}}>Page Content</main>\n      <Footer />\n    </div>\n  );\n}',
    'index.css': 'body { margin: 0; font-family: sans-serif; }',
    'main.tsx': 'import React from "react";\nimport ReactDOM from "react-dom/client";\nimport App from "./App.tsx";\nimport "./index.css";\n\nReactDOM.createRoot(document.getElementById("root")!).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n);',
  },
  'index.html': '<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>Preview</title>\n  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="/src/main.tsx"></script>\n  </body>\n</html>',
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
  const [activeFile, setActiveFile] = useState<string>('src/App.tsx');
  const [view, setView] = useState<'editor' | 'preview'>('editor');

  const [steps, setSteps] = useState<Step[]>([]);

  useEffect(() => {
    async function init() {
      const prompt = localStorage.getItem("prompt");
      if (!prompt) return;

      // First, get the skeleton prompts
      const skeletonResponse = await axios.post(`http://localhost:3000/api/skeleton`, {
        prompt: prompt.trim()
      });
      const { prompts } = skeletonResponse.data;

      // Now, make the streaming chat request using fetch
      const response = await fetch(`http://localhost:3000/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...prompts, prompt].map(content => ({
            role: "user",
            parts: [{ text: content }]
          }))
        })
      });

      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      // Read the stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        fullResponse += decoder.decode(value);
        
        // Try to parse the accumulated string as XML
        // This will update the UI in real-time as valid XML structures are formed
        const parsedSteps = parseXml(fullResponse);
        if (parsedSteps) {
            setSteps(parsedSteps);
        }
      }
    }

    init();
  }, []);

  const handleFileSelect = (path: string) => {
    setActiveFile(path);
  };

  const handleCodeChange = (newCode: string) => {
    if (activeFile) {
      setFiles(prevFiles => updateFileContent(prevFiles, activeFile, newCode));
    }
  };

  return(
    <div className="h-screen w-full bg-zinc-950 flex flex-col items-center justify-center">

      {/* Navbar */}
      <div className="h-[7%] w-full border-b border-gray-700 flex items-center justify-end px-4">
        <button
          onClick={() => setView(view === 'editor' ? 'preview' : 'editor')}
          className="bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-600 transition-colors hover:cursor-pointer"
        >
          {view === 'editor' ? 'Show Preview' : 'Show Editor'}
        </button>
      </div>

      {/* Builder Area */}
      <div className="h-[93%] w-full flex px-2 py-3 gap-2">

        {/* Ai chat */}
        <div className="h-full w-[30%] border border-gray-700 rounded-xl">
          {/* <AIChat steps={steps} /> */}

          <h1 className="text-white">{steps}</h1>
        </div>

        {/* Code And Preview */}
        <div className="h-full w-[70%] flex border border-gray-700 rounded-xl overflow-hidden">
          {view === 'editor' ? (
            <>
              {/* File Explorer */}
              <div className="h-full w-[30%] border-r border-gray-700">
                <FileExplorer files={files} onFileSelect={handleFileSelect} />
              </div>

              {/* Code Editor */}
              <div className="h-full w-[70%]">
                <CodeEditor
                  value={getFileContent(files, activeFile)}
                  onChange={(value) => handleCodeChange(value || '')}
                />
              </div>
            </>
          ) : (
            // Preview Section
            <div className="h-full w-full">
              <Preview files={files} />
            </div>
          )}
        </div>

      </div>

    </div>
  )
}