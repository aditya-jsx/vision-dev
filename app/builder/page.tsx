// "use client";

// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import AIChat from "./components/AIChat";
// import { FileExplorer } from "./components/FileExplorer";
// import { Step, StepType, FileItem } from "../lib/types";
// import { parseXml } from "../utils/parseXml";
// import {
//   Code2,
//   Eye,
//   Terminal as TerminalIcon,
//   Play,
//   RefreshCw,
//   ChevronUp,
//   ChevronDown,
// } from "lucide-react";
// import { CodeEditor } from "./components/CodeEditor";
// import { useWebContainer } from "../hooks/useWebContainer";
// import Preview from "./components/Preview";
// import Loader from "../components/Loader";

// function TabView({
//   activeTab,
//   onTabChange,
//   onReloadPreview,
//   isTerminalOpen,
//   onToggleTerminal,
// }: {
//   activeTab: "code" | "preview";
//   onTabChange: (tab: "code" | "preview") => void;
//   onReloadPreview: () => void;
//   isTerminalOpen: boolean;
//   onToggleTerminal: () => void;
// }) {
//   return (
//     <div className="flex items-center space-x-2 px-2 pt-2 border-b border-zinc-700">
//       {/* Left Tabs */}
//       <button
//         onClick={() => onTabChange("code")}
//         className={`flex items-center gap-2 px-4 py-2 rounded-t-md text-sm transition-colors ${
//           activeTab === "code"
//             ? "bg-zinc-800 text-white"
//             : "text-zinc-400 hover:bg-zinc-800"
//         }`}
//       >
//         <Code2 className="w-4 h-4" /> Code
//       </button>
//       <button
//         onClick={() => onTabChange("preview")}
//         className={`flex items-center gap-2 px-4 py-2 rounded-t-md text-sm transition-colors ${
//           activeTab === "preview"
//             ? "bg-zinc-800 text-white"
//             : "text-zinc-400 hover:bg-zinc-800"
//         }`}
//       >
//         <Eye className="w-4 h-4" /> Preview
//       </button>

//       {/* Spacer */}
//       <div className="flex-grow" />

//       {/* Right Buttons */}
//       {activeTab === "preview" && (
//         <button
//           onClick={onReloadPreview}
//           title="Reload Preview"
//           className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-zinc-400 hover:bg-zinc-800 transition-colors"
//         >
//           <RefreshCw className="w-4 h-4" />
//         </button>
//       )}

//       <button
//         onClick={onToggleTerminal}
//         className={`flex items-center gap-2 px-4 py-2 rounded-t-md text-sm transition-colors ${
//           isTerminalOpen
//             ? "bg-zinc-800 text-white"
//             : "text-zinc-400 hover:bg-zinc-800"
//         }`}
//       >
//         <TerminalIcon className="w-4 h-4" />
//         <span>Terminal</span>
//         {isTerminalOpen ? (
//           <ChevronDown className="w-4 h-4" />
//         ) : (
//           <ChevronUp className="w-4 h-4" />
//         )}
//       </button>
//     </div>
//   );
// }

// function buildFileTreeFromSteps(steps: Step[]): FileItem[] {
//   const fileTree: FileItem[] = [];
//   const allPaths = new Map<string, FileItem>();

//   const sortedSteps = [...steps].sort((a, b) => {
//     const aDepth = a.path?.split("/").length || 0;
//     const bDepth = b.path?.split("/").length || 0;
//     return aDepth - bDepth;
//   });

//   for (const step of sortedSteps) {
//     if (
//       (step.type === StepType.CreateFile ||
//         step.type === StepType.CreateFolder) &&
//       step.path
//     ) {
//       const pathParts = step.path.split("/").filter((p) => p);
//       let currentLevel = fileTree;
//       let currentPath = "";

//       for (let i = 0; i < pathParts.length; i++) {
//         const part = pathParts[i];
//         currentPath = currentPath ? `${currentPath}/${part}` : part;
//         const isLastPart = i === pathParts.length - 1;

//         let existingNode = allPaths.get(currentPath);

//         if (!existingNode) {
//           const newNode: FileItem = {
//             name: part,
//             type:
//               isLastPart && step.type === StepType.CreateFile
//                 ? "file"
//                 : "folder",
//             path: currentPath,
//             children:
//               isLastPart && step.type === StepType.CreateFile ? undefined : [],
//             content:
//               isLastPart && step.type === StepType.CreateFile
//                 ? step.code
//                 : undefined,
//           };

//           currentLevel.push(newNode);
//           allPaths.set(currentPath, newNode);
//           existingNode = newNode;
//         }

//         if (existingNode.type === "folder") {
//           currentLevel = existingNode.children!;
//         }
//       }
//     }
//   }
//   return fileTree;
// }

// export default function Builder() {
//   const [steps, setSteps] = useState<Step[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [files, setFiles] = useState<FileItem[]>([]);
//   const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
//   const [activeTab, setActiveTab] = useState<"code" | "preview">("code");
//   const [isTerminalOpen, setIsTerminalOpen] = useState(false);
//   const {
//     webContainer,
//     terminalEl,
//     previewUrl,
//     inputWriter,
//     refitTerminal,
//     restartShellProcess,
//   } = useWebContainer();
//   const [reloadKey, setReloadKey] = useState(0);

//   const isWebContainerBooted = !!webContainer;
//   const isShellReady = !!inputWriter;

//   useEffect(() => {
//     init();
//   }, []);

//   useEffect(() => {
//     if (isTerminalOpen) {
//       const timer = setTimeout(() => {
//         refitTerminal();
//       }, 350);
//       return () => clearTimeout(timer);
//     }
//   }, [isTerminalOpen, refitTerminal]);

//   useEffect(() => {
//     const processSteps = async () => {
//       if (!isShellReady || !webContainer) return;

//       const pendingStep = steps.find((s) => s.status === "pending");
//       if (!pendingStep) return;

//       setSteps((currentSteps) =>
//         currentSteps.map((s) =>
//           s.id === pendingStep.id ? { ...s, status: "in-progress" } : s
//         )
//       );

//       await executeStep(pendingStep);

//       setSteps((currentSteps) =>
//         currentSteps.map((s) =>
//           s.id === pendingStep.id ? { ...s, status: "completed" } : s
//         )
//       );
//     };

//     processSteps();
//   }, [steps, webContainer, isShellReady]);

//   useEffect(() => {
//     if (previewUrl) {
//       setActiveTab("preview");
//       setIsTerminalOpen(true);
//     }
//   }, [previewUrl]);

//   const executeStep = async (step: Step) => {
//     if (!webContainer) return;

//     try {
//       switch (step.type) {
//         case StepType.CreateFile:
//           await createFileOrFolder(step, "file");
//           break;
//         case StepType.CreateFolder:
//           await createFileOrFolder(step, "folder");
//           break;
//         case StepType.RunScript:
//           if (step.code && inputWriter) {
//             await inputWriter.write(step.code + "\n");
//           } else {
//              console.warn("RunScript step skipped: inputWriter not ready or no code");
//           }
//           break;
//       }
//     } catch (e: any) {
//       setError(`Failed at step: ${step.title} - ${e.message}`);
//       setSteps((currentSteps) =>
//         currentSteps.map((s) =>
//           s.id === step.id
//             ? { ...s, status: "failed", description: e.message }
//             : s
//         )
//       );
//     }
//   };

//   const createFileOrFolder = async (
//     step: Step,
//     type: "file" | "folder"
//   ) => {
//     if (!step.path || !webContainer) return;

//     const pathParts = step.path.split("/").filter((p) => p);
//     if (pathParts.length === 0) return;

//     if (pathParts.length > 1) {
//       const dirPath = pathParts.slice(0, -1).join("/");
//       await webContainer.fs.mkdir(dirPath, { recursive: true });
//     }

//     if (type === "file") {
//       await webContainer.fs.writeFile(step.path, step.code || "");
//     }

//     setFiles((currentFiles) => {
//       const newFileTree = [...currentFiles];
//       let currentLevel = newFileTree;
//       let currentPath = "";

//       for (let i = 0; i < pathParts.length; i++) {
//         const part = pathParts[i];
//         currentPath = currentPath ? `${currentPath}/${part}` : part;
//         const isLastPart = i === pathParts.length - 1;

//         let existingNode = currentLevel.find((node) => node.name === part);

//         if (existingNode) {
//           if (existingNode.type === "folder" && !isLastPart) {
//             currentLevel = existingNode.children!;
//           } else if (
//             existingNode.type === "file" &&
//             isLastPart &&
//             type === "file"
//           ) {
//             existingNode.content = step.code;
//           } else if (
//             existingNode.type === "folder" &&
//             isLastPart &&
//             type === "file"
//           ) {
//             console.error(
//               `Path conflict: Trying to create file where folder exists: ${currentPath}`
//             );
//           }
//         } else {
//           const newNodeType =
//             isLastPart && type === "file" ? "file" : "folder";
//           const newNode: FileItem = {
//             name: part,
//             type: newNodeType,
//             path: currentPath,
//             children: newNodeType === "folder" ? [] : undefined,
//             content:
//               newNodeType === "file" ? step.code || "" : undefined,
//           };
//           currentLevel.push(newNode);

//           if (newNodeType === "folder") {
//             currentLevel = newNode.children!;
//           }
//         }
//       }
//       return newFileTree;
//     });
//   };

//   const handleRun = async () => {
//     if (!isWebContainerBooted) {
//       setError("WebContainer is not ready. Please wait.");
//       return;
//     }

//     setIsTerminalOpen(true);
//     setError(null);

//     try {
//       const newWriter = await restartShellProcess();

//       if (newWriter) {
//         await newWriter.write("npm install\n");
//         await newWriter.write("npm run dev\n");
//       } else {
//         setError("Failed to restart terminal. Please try again.");
//       }
//     } catch (e: any) {
//       setError(`Failed to run commands: ${e.message}`);
//     }
//   };

//   const handleReloadPreview = () => setReloadKey((prev) => prev + 1);

//   async function init() {
//     const prompt = localStorage.getItem("prompt");
//     if (!prompt) {
//       setError("No prompt found in local storage.");
//       return;
//     }

//     setIsLoading(true);
//     setError(null);
//     setSteps([]);
//     setFiles([]);

//     try {
//       const skeletonResponse = await axios.post(`/api/skeleton`, {
//         prompt: prompt.trim(),
//       });
//       const { prompts, uiPrompt } = skeletonResponse.data;

//       if (!prompts || !uiPrompt || !uiPrompt[0])
//         throw new Error("Invalid response from skeleton API.");

//       const initialSteps = parseXml(uiPrompt[0]);

//       const initialFileTree = buildFileTreeFromSteps(initialSteps);
//       setFiles(initialFileTree);

//       setSteps(initialSteps);

//       const messages = [...prompts, prompt].map((content) => ({
//         role: "user",
//         parts: [{ text: content }],
//       }));
//       const stepsResponse = await axios.post(`/api/chat`, {
//         messages,
//       });
//       const detailedStepsXml = stepsResponse.data.output;
//       if (!detailedStepsXml)
//         throw new Error("Invalid response from detailed steps API.");

//       const detailedSteps = parseXml(detailedStepsXml);

//       const nextId = initialSteps.length + 1;
//       setSteps((currentSteps) => [
//         ...currentSteps,
//         ...detailedSteps.map((step, i) => ({ ...step, id: nextId + i })),
//       ]);
//     } catch (err: any) {
//       setError(err.message || "An error occurred.");
//     } finally {
//       setIsLoading(false);
//     }
//   }

//   return (
//     <div className="h-screen w-full bg-zinc-950 flex flex-col items-center justify-center">
//       <div className="h-[7%] w-full border-b border-gray-700 flex items-center justify-between px-4">
//         <button
//           onClick={handleRun}
//           disabled={!isWebContainerBooted}
//           className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors disabled:bg-zinc-700 disabled:text-zinc-400 disabled:cursor-not-allowed hover:bg-green-500"
//         >
//           {!isWebContainerBooted ? (
//             <>
//               <Loader />
//               <span>Booting...</span>
//             </>
//           ) : (
//             <>
//               <Play className="w-4 h-4" /> Run
//             </>
//           )}
//         </button>
//         <button className="bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-600">
//           Export Code
//         </button>
//       </div>
//       <div className="h-[93%] w-full flex px-2 py-3 gap-2">
//         <div className="h-full w-[27%] border border-gray-700 rounded-xl">
//           <AIChat steps={steps} isLoading={isLoading} />
//         </div>

//         <div className="h-full w-[20%]">
//           <FileExplorer files={files} onFileSelect={setSelectedFile} />
//         </div>
//         <div className="h-full w-[53%] flex flex-col border border-gray-700 rounded-xl overflow-hidden bg-zinc-900">
//           <TabView
//             activeTab={activeTab}
//             onTabChange={setActiveTab}
//             onReloadPreview={handleReloadPreview}
//             isTerminalOpen={isTerminalOpen}
//             onToggleTerminal={() => setIsTerminalOpen(!isTerminalOpen)}
//           />
//           {/* Code/Preview and Terminal */}
//           <div className="flex-1 flex flex-col overflow-hidden">
//             {/* Code/Preview Section */}
//             <div
//               className={`${
//                 isTerminalOpen ? "h-[65%]" : "h-full"
//               } w-full transition-all duration-300`}
//             >
//               {" "}
//               <div
//                 className={`h-full w-full ${
//                   activeTab === "code" ? "" : "hidden"
//                 }`}
//               >
//                 <CodeEditor file={selectedFile} />
//               </div>
//               <div
//                 className={`h-full w-full ${
//                   activeTab === "preview" ? "" : "hidden"
//                 }`}
//               >
//                 <Preview url={previewUrl} reloadKey={reloadKey} />
//               </div>
//             </div>

//             {/* Terminal Section */}
//             <div
//               className={`w-full bg-black transition-all duration-300 ${
//                 isTerminalOpen ? "h-[35%]" : "h-0" // Collapsible height
//               } overflow-hidden`}
//             >
//               <div ref={terminalEl} className="h-full w-full p-1" />
//             </div>
//           </div>

//           {error && (
//             <div className="p-2 bg-red-900/30 border-t border-red-700 text-center">
//               {" "}
//               <p className="text-red-400 font-semibold">{error}</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

















"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import AIChat from "./components/AIChat";
import { FileExplorer } from "./components/FileExplorer";
import { Step, StepType, FileItem } from "../lib/types";
import { parseXml } from "../utils/parseXml";
import {
  Code2,
  Eye,
  Terminal as TerminalIcon,
  Play,
  RefreshCw,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { CodeEditor } from "./components/CodeEditor";
import { useWebContainer } from "../hooks/useWebContainer";
import Preview from "./components/Preview";
import Loader from "../components/Loader";

function TabView({
  activeTab,
  onTabChange,
  onReloadPreview,
  isTerminalOpen,
  onToggleTerminal,
}: {
  activeTab: "code" | "preview";
  onTabChange: (tab: "code" | "preview") => void;
  onReloadPreview: () => void;
  isTerminalOpen: boolean;
  onToggleTerminal: () => void;
}) {
  return (
    <div className="flex items-center space-x-2 px-2 pt-2 border-b border-zinc-700">
      {/* Left Tabs */}
      <button
        onClick={() => onTabChange("code")}
        className={`flex items-center gap-2 px-4 py-2 rounded-t-md text-sm transition-colors ${
          activeTab === "code"
            ? "bg-zinc-800 text-white"
            : "text-zinc-400 hover:bg-zinc-800"
        }`}
      >
        <Code2 className="w-4 h-4" /> Code
      </button>
      <button
        onClick={() => onTabChange("preview")}
        className={`flex items-center gap-2 px-4 py-2 rounded-t-md text-sm transition-colors ${
          activeTab === "preview"
            ? "bg-zinc-800 text-white"
            : "text-zinc-400 hover:bg-zinc-800"
        }`}
      >
        <Eye className="w-4 h-4" /> Preview
      </button>

      {/* Spacer */}
      <div className="flex-grow" />

      {/* Right Buttons */}
      {activeTab === "preview" && (
        <button
          onClick={onReloadPreview}
          title="Reload Preview"
          className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-zinc-400 hover:bg-zinc-800 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      )}

      <button
        onClick={onToggleTerminal}
        className={`flex items-center gap-2 px-4 py-2 rounded-t-md text-sm transition-colors ${
          isTerminalOpen
            ? "bg-zinc-800 text-white"
            : "text-zinc-400 hover:bg-zinc-800"
        }`}
      >
        <TerminalIcon className="w-4 h-4" />
        <span>Terminal</span>
        {isTerminalOpen ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronUp className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}

function buildFileTreeFromSteps(steps: Step[]): FileItem[] {
  const fileTree: FileItem[] = [];
  const allPaths = new Map<string, FileItem>();

  const sortedSteps = [...steps].sort((a, b) => {
    const aDepth = a.path?.split("/").length || 0;
    const bDepth = b.path?.split("/").length || 0;
    return aDepth - bDepth;
  });

  for (const step of sortedSteps) {
    if (
      (step.type === StepType.CreateFile ||
        step.type === StepType.CreateFolder) &&
      step.path
    ) {
      const pathParts = step.path.split("/").filter((p) => p);
      let currentLevel = fileTree;
      let currentPath = "";

      for (let i = 0; i < pathParts.length; i++) {
        const part = pathParts[i];
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        const isLastPart = i === pathParts.length - 1;

        let existingNode = allPaths.get(currentPath);

        if (!existingNode) {
          const newNode: FileItem = {
            name: part,
            type:
              isLastPart && step.type === StepType.CreateFile
                ? "file"
                : "folder",
            path: currentPath,
            children:
              isLastPart && step.type === StepType.CreateFile ? undefined : [],
            content:
              isLastPart && step.type === StepType.CreateFile
                ? step.code
                : undefined,
          };

          currentLevel.push(newNode);
          allPaths.set(currentPath, newNode);
          existingNode = newNode;
        }

        if (existingNode.type === "folder") {
          currentLevel = existingNode.children!;
        }
      }
    }
  }
  return fileTree;
}

export default function Builder() {
  const [steps, setSteps] = useState<Step[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code");
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isFileSystemReady, setIsFileSystemReady] = useState(false);
  const {
    webContainer,
    terminalEl,
    previewUrl,
    inputWriter,
    refitTerminal,
    restartShellProcess,
  } = useWebContainer();
  const [reloadKey, setReloadKey] = useState(0);

  const isWebContainerBooted = !!webContainer;
  const isShellReady = !!inputWriter;

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (isTerminalOpen) {
      const timer = setTimeout(() => {
        refitTerminal();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isTerminalOpen, refitTerminal]);

  useEffect(() => {
    const processSteps = async () => {
      if (!webContainer) return;

      const pendingStep = steps.find((s) => s.status === "pending");

      if (!pendingStep) {
        const fileSteps = steps.filter(
          (s) =>
            s.type === StepType.CreateFile || s.type === StepType.CreateFolder
        );
        if (fileSteps.length > 0 && fileSteps.every((s) => s.status === "completed")) {
          setIsFileSystemReady(true);
        }
        return;
      }

      if (pendingStep.type === StepType.RunScript) {
        setSteps((currentSteps) =>
          currentSteps.map((s) =>
            s.id === pendingStep.id
              ? { ...s, status: "completed" }
              : s
          )
        );
        return;
      }

      setSteps((currentSteps) =>
        currentSteps.map((s) =>
          s.id === pendingStep.id ? { ...s, status: "in-progress" } : s
        )
      );

      await executeStep(pendingStep);

      setSteps((currentSteps) =>
        currentSteps.map((s) =>
          s.id === pendingStep.id ? { ...s, status: "completed" } : s
        )
      );
    };

    processSteps();
  }, [steps, webContainer]);

  useEffect(() => {
    if (previewUrl) {
      setActiveTab("preview");
      setIsTerminalOpen(true);
    }
  }, [previewUrl]);

  const executeStep = async (step: Step) => {
    if (!webContainer) return;

    try {
      switch (step.type) {
        case StepType.CreateFile:
          await createFileOrFolder(step, "file");
          break;
        case StepType.CreateFolder:
          await createFileOrFolder(step, "folder");
          break;
        case StepType.RunScript:
          if (step.code && inputWriter) {
            await inputWriter.write(step.code + "\n");
          } else {
             console.warn("RunScript step skipped: inputWriter not ready or no code");
          }
          break;
      }
    } catch (e: any) {
      setError(`Failed at step: ${step.title} - ${e.message}`);
      setSteps((currentSteps) =>
        currentSteps.map((s) =>
          s.id === step.id
            ? { ...s, status: "failed", description: e.message }
            : s
        )
      );
    }
  };

  const createFileOrFolder = async (
    step: Step,
    type: "file" | "folder"
  ) => {
    if (!step.path || !webContainer) return;

    const pathParts = step.path.split("/").filter((p) => p);
    if (pathParts.length === 0) return;

    if (pathParts.length > 1) {
      const dirPath = pathParts.slice(0, -1).join("/");
      await webContainer.fs.mkdir(dirPath, { recursive: true });
    }

    if (type === "file") {
      await webContainer.fs.writeFile(step.path, step.code || "");
    }

    setFiles((currentFiles) => {
      const newFileTree = [...currentFiles];
      let currentLevel = newFileTree;
      let currentPath = "";

      for (let i = 0; i < pathParts.length; i++) {
        const part = pathParts[i];
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        const isLastPart = i === pathParts.length - 1;

        let existingNode = currentLevel.find((node) => node.name === part);

        if (existingNode) {
          if (existingNode.type === "folder" && !isLastPart) {
            currentLevel = existingNode.children!;
          } else if (
            existingNode.type === "file" &&
            isLastPart &&
            type === "file"
          ) {
            existingNode.content = step.code;
          } else if (
            existingNode.type === "folder" &&
            isLastPart &&
            type === "file"
          ) {
            console.error(
              `Path conflict: Trying to create file where folder exists: ${currentPath}`
            );
          }
        } else {
          const newNodeType =
            isLastPart && type === "file" ? "file" : "folder";
          const newNode: FileItem = {
            name: part,
            type: newNodeType,
            path: currentPath,
            children: newNodeType === "folder" ? [] : undefined,
            content:
              newNodeType === "file" ? step.code || "" : undefined,
          };
          currentLevel.push(newNode);

          if (newNodeType === "folder") {
            currentLevel = newNode.children!;
          }
        }
      }
      return newFileTree;
    });
  };

  const handleRun = async () => {

    if (!isShellReady || !inputWriter) {
      setError("WebContainer is not ready. Please wait.");
      return;
    }

    setIsTerminalOpen(true);
    setError(null);

    try {
      await inputWriter.write("npm install\n");
      await inputWriter.write("npm run dev\n");
    } catch (e: any) {
      setError(`Failed to run commands: ${e.message}`);
    }
  };

  const handleReloadPreview = () => setReloadKey((prev) => prev + 1);

  async function init() {
    const prompt = localStorage.getItem("prompt");
    if (!prompt) {
      setError("No prompt found in local storage.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSteps([]);
    setFiles([]);

    try {
      const skeletonResponse = await axios.post(`/api/skeleton`, {
        prompt: prompt.trim(),
      });
      const { prompts, uiPrompt } = skeletonResponse.data;

      if (!prompts || !uiPrompt || !uiPrompt[0])
        throw new Error("Invalid response from skeleton API.");

      const initialSteps = parseXml(uiPrompt[0]);

      const initialFileTree = buildFileTreeFromSteps(initialSteps);
      setFiles(initialFileTree);

      setSteps(initialSteps);

      const messages = [...prompts, prompt].map((content) => ({
        role: "user",
        parts: [{ text: content }],
      }));
      const stepsResponse = await axios.post(`/api/chat`, {
        messages,
      });
      const detailedStepsXml = stepsResponse.data.output;
      if (!detailedStepsXml)
        throw new Error("Invalid response from detailed steps API.");

      const detailedSteps = parseXml(detailedStepsXml);

      const nextId = initialSteps.length + 1;
      setSteps((currentSteps) => [
        ...currentSteps,
        ...detailedSteps.map((step, i) => ({ ...step, id: nextId + i })),
      ]);
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="h-screen w-full bg-zinc-950 flex flex-col items-center justify-center">
      <div className="h-[7%] w-full border-b border-gray-700 flex items-center justify-between px-4">
        <button
          onClick={handleRun}
          disabled={!isWebContainerBooted}
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors disabled:bg-zinc-700 disabled:text-zinc-400 disabled:cursor-not-allowed hover:bg-green-500"
        >
          {!isWebContainerBooted ? (
            <>
              <Loader />
              <span>Booting...</span>
            </>
          ) : !isFileSystemReady ? (
            <>
              <Loader />
              <span>Writing files...</span>
            </>
          ) : !isShellReady ? (
            <>
              <Loader />
              <span>Booting shell...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" /> Run
            </>
          )}
        </button>
        <button className="bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-600">
          Export Code
        </button>
      </div>
      <div className="h-[93%] w-full flex px-2 py-3 gap-2">
        <div className="h-full w-[27%] border border-gray-700 rounded-xl">
          <AIChat steps={steps} isLoading={isLoading} />
        </div>

        <div className="h-full w-[20%]">
          <FileExplorer files={files} onFileSelect={setSelectedFile} />
        </div>
        <div className="h-full w-[53%] flex flex-col border border-gray-700 rounded-xl overflow-hidden bg-zinc-900">
          <TabView
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onReloadPreview={handleReloadPreview}
            isTerminalOpen={isTerminalOpen}
            onToggleTerminal={() => setIsTerminalOpen(!isTerminalOpen)}
          />
          {/* Code/Preview and Terminal */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Code/Preview Section */}
            <div
              className={`${
                isTerminalOpen ? "h-[65%]" : "h-full"
              } w-full transition-all duration-300`}
            >
              {" "}
              <div
                className={`h-full w-full ${
                  activeTab === "code" ? "" : "hidden"
                }`}
              >
                <CodeEditor file={selectedFile} />
              </div>
              <div
                className={`h-full w-full ${
                  activeTab === "preview" ? "" : "hidden"
                }`}
              >
                <Preview url={previewUrl} reloadKey={reloadKey} />
              </div>
            </div>

            {/* Terminal Section */}
            <div
              className={`w-full bg-black transition-all duration-300 ${
                isTerminalOpen ? "h-[35%]" : "h-0" // Collapsible height
              } overflow-hidden`}
            >
              <div ref={terminalEl} className="h-full w-full p-1" />
            </div>
          </div>

          {error && (
            <div className="p-2 bg-red-900/30 border-t border-red-700 text-center">
              {" "}
              <p className="text-red-400 font-semibold">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}