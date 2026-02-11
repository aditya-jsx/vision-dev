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
  Download,
  PanelLeft,
} from "lucide-react";
import { CodeEditor } from "./components/CodeEditor";
import { useWebContainer } from "../hooks/useWebContainer";
import Preview from "./components/Preview";
import Loader from "../components/Loader";

import JSZip from 'jszip';

// Helper function for formatting code using dynamic imports to avoid initial load crashes
const formatCode = async (content: string, fileName: string): Promise<string> => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  
  try {
    const prettier = await import('prettier/standalone');
    const plugins = [];
    let parser = '';

    switch (ext) {
      case 'ts':
      case 'tsx':
        parser = 'typescript';
        plugins.push((await import('prettier/plugins/typescript')).default);
        plugins.push((await import('prettier/plugins/estree')).default);
        break;
      case 'js':
      case 'jsx':
        parser = 'babel';
        plugins.push((await import('prettier/plugins/babel')).default);
        plugins.push((await import('prettier/plugins/estree')).default);
        break;
      case 'css':
        parser = 'css';
        plugins.push((await import('prettier/plugins/postcss')).default);
        break;
      case 'html':
        parser = 'html';
        plugins.push((await import('prettier/plugins/html')).default);
        break;
      case 'json':
        parser = 'json';
        plugins.push((await import('prettier/plugins/babel')).default);
        plugins.push((await import('prettier/plugins/estree')).default);
        break;
      case 'md':
        parser = 'markdown';
        plugins.push((await import('prettier/plugins/markdown')).default);
        break;
      default:
        return content;
    }

    if (!parser) return content;

    return await prettier.format(content, {
      parser,
      plugins,
    });
  } catch (e) {
    console.warn(`Prettier format failed for ${fileName}:`, e);
    return content;
  }
};

type ChatMessage = {
  type: 'user' | 'ai';
  content: string;
  steps?: Step[];
};

type ApiMessage = {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
};

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

      {activeTab === "code" && (
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
      )}
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
  
  const [isChatPanelOpen, setIsChatPanelOpen] = useState(true);
  
  const [chatLog, setChatLog] = useState<ChatMessage[]>([]);
  const [messageHistory, setMessageHistory] = useState<ApiMessage[]>([]);
  
  const {
    webContainer,
    terminalEl,
    previewUrl,
    inputWriter,
    refitTerminal,
  } = useWebContainer();
  const [reloadKey, setReloadKey] = useState(0);
  const [isFileSystemReady, setIsFileSystemReady] = useState(false);

  const isWebContainerBooted = !!webContainer;
  const isShellReady = !!inputWriter;


  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (activeTab === 'preview') {
      setIsTerminalOpen(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (isTerminalOpen && activeTab === 'code') {
      const timer = setTimeout(() => {
        refitTerminal();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isTerminalOpen, refitTerminal, activeTab]);

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
    const promptFromStorage = localStorage.getItem("prompt");
    
    if (!promptFromStorage) {
      setError("No prompt found in local storage.");
      return;
    }
    
    setChatLog([{ type: 'user', content: promptFromStorage }]);
    setIsLoading(true);
    setError(null);
    setSteps([]);
    setFiles([]);

    try {
      const skeletonResponse = await axios.post(`/api/skeleton`, {
        prompt: promptFromStorage.trim(),
      });
      const { prompts, uiPrompt } = skeletonResponse.data;

      if (!prompts || !uiPrompt || !uiPrompt[0])
        throw new Error("Invalid response from skeleton API.");

      const initialSteps = parseXml(uiPrompt[0]);
      const initialFileTree = buildFileTreeFromSteps(initialSteps);
      setFiles(initialFileTree);
      setSteps(initialSteps);

      setChatLog(prev => [...prev, { type: 'ai', content: "Okay, I'll start with these files:", steps: initialSteps }]);

      const messages: ApiMessage[] = [...prompts, promptFromStorage].map((content): ApiMessage => ({
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
      const detailedStepsWithIds = detailedSteps.map((step, i) => ({ ...step, id: nextId + i }));

      setSteps((currentSteps) => [
        ...currentSteps,
        ...detailedStepsWithIds,
      ]);

      setChatLog(prev => [...prev, { type: 'ai', content: "Here are the next steps:", steps: detailedStepsWithIds }]);

      const aiResponseMessage: ApiMessage = { role: 'model', parts: [{ text: detailedStepsXml }] };
      setMessageHistory([...messages, aiResponseMessage]);

    } catch (err: any) {
      setError(err.message || "An error occurred.");
      setChatLog(prev => [...prev, { type: 'ai', content: `An error occurred: ${err.message}` }]);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSendNewMessage = async (newMessage: string) => {
    setIsLoading(true);
    setChatLog(prev => [...prev, { type: 'user', content: newMessage }]);

    const newApiMessage: ApiMessage = { role: 'user', parts: [{ text: newMessage }] };
    const newApiHistory = [...messageHistory, newApiMessage];

    try {
      const response = await axios.post('/api/chat', { messages: newApiHistory });
      const newStepsXml = response.data.output;
      const aiResponseMessage: ApiMessage = { role: 'model', parts: [{ text: newStepsXml }] };

      setMessageHistory([...newApiHistory, aiResponseMessage]);

      const newSteps = parseXml(newStepsXml);
      const nextId = (steps.length > 0 ? Math.max(...steps.map(s => s.id)) : 0) + 1;
      const newStepsWithIds = newSteps.map((step, i) => ({ ...step, id: nextId + i }));

      setSteps(prev => [...prev, ...newStepsWithIds]);

      setChatLog(prev => [...prev, { type: 'ai', content: "Here's what I'll do next:", steps: newStepsWithIds }]);

    } catch (e: any) {
      const errMessage = e.message || "An unknown error occurred.";
      setError(errMessage);
      setChatLog(prev => [...prev, { type: 'ai', content: `An error occurred: ${errMessage}` }]);
    } finally {
      setIsLoading(false);
    }
  };


  const handleSaveFile = async (path: string, newContent: string) => {
    if (!webContainer) return;

    try {
      await webContainer.fs.writeFile(path, newContent);

      const updateRecursive = (items: FileItem[], path: string, content: string): FileItem[] => {
        return items.map(item => {
          if (item.path === path) {
            return { ...item, content: content };
          }
          if (item.children) {
            return { ...item, children: updateRecursive(item.children, path, content) };
          }
          return item;
        });
      };
      setFiles(currentFiles => updateRecursive(currentFiles, path, newContent));

      if (selectedFile && selectedFile.path === path) {
        setSelectedFile(prev => prev ? { ...prev, content: newContent } : null);
      }
      
      console.log(`File ${path} saved!`);

    } catch (e: any) {
      setError(`Failed to save file: ${e.message}`);
    }
  };

  const handleExportCode = async () => {
    if (!webContainer) {
      setError("WebContainer not ready.");
      return;
    }

    let projectName = 'project';
    try {
      const pkgJsonContent = await webContainer.fs.readFile('package.json', 'utf-8');
      const pkg = JSON.parse(pkgJsonContent);
      projectName = pkg.name || 'project';
    } catch (e) {
      console.warn('Could not read project name from package.json', e);
    }

    const zip = new JSZip();

    const addFilesToZip = async (items: FileItem[], folder: JSZip) => {
      for (const item of items) {
        if (item.type === 'folder') {
          const childFolder = folder.folder(item.name);
          if (childFolder && item.children) {
            await addFilesToZip(item.children, childFolder);
          }
        } else if (item.type === 'file' && item.path) {
          try {
            const content = await webContainer.fs.readFile(item.path, 'utf-8');
            const formattedContent = await formatCode(content, item.name);
            folder.file(item.name, formattedContent);
          } catch (e) {
            console.error(`Failed to read or format file ${item.path}:`, e);
            if (item.content) {
               const formattedContent = await formatCode(item.content, item.name);
               folder.file(item.name, formattedContent);
            }
          }
        }
      }
    };

    try {
      setError(null);
      await addFilesToZip(files, zip);
      const blob = await zip.generateAsync({ type: 'blob' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${projectName}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

    } catch (e: any) {
      setError(`Failed to create zip file: ${e.message}`);
    }
  };


  return (
    <div className="h-screen w-full bg-zinc-950 flex flex-col items-center justify-center">
      <div className="h-[7%] w-full  flex items-center justify-between px-2.5">
        <span className="text-2xl font-bold bg-gradient-to-r from-[#354a64] to-[#8191a9] bg-clip-text text-transparent">
              Vision
            </span>
        <div className="flex gap-2">
          <button
            onClick={handleRun}
            disabled={!isWebContainerBooted || !isFileSystemReady || !isShellReady}
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
          <button 
            onClick={handleExportCode}
            disabled={!isWebContainerBooted || files.length === 0}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-gray-600 transition-colors disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Export Code
          </button>
        </div>
      </div>

      {/* --- Main Content Area --- */}
      <div className={`relative h-[93%] w-full flex px-2 pb-1 transition-all duration-500 ease-in-out ${isChatPanelOpen ? 'gap-2' : 'gap-0'}`}>
        
        {/* Chat Panel */}
        <div className={`h-full rounded-xl transition-all duration-500 ease-in-out ${isChatPanelOpen ? 'w-1/3 border border-gray-700' : 'w-0 border-0'} overflow-hidden`}>
          <AIChat 
            chatLog={chatLog}
            isLoading={isLoading}
            onSendMessage={handleSendNewMessage}
            onClose={() => setIsChatPanelOpen(false)}
          />
        </div>

        {/* Code / Preview + Terminal */}
        <div className={`h-full ${isChatPanelOpen ? 'w-2/3' : 'w-full'} flex flex-col border border-gray-700 rounded-xl overflow-hidden bg-zinc-900 transition-all duration-500 ease-in-out relative`}>
          {!isChatPanelOpen && (
            <button
              onClick={() => setIsChatPanelOpen(true)}
              className="absolute top-2 left-2 z-10 p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white"
              title="Open Chat"
            >
              <PanelLeft className="w-5 h-5" />
            </button>
          )}

          <TabView
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onReloadPreview={handleReloadPreview}
            isTerminalOpen={isTerminalOpen}
            onToggleTerminal={() => setIsTerminalOpen(!isTerminalOpen)}
          />

          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Explorer + Editor + Terminal */}
            <div
              className={`flex flex-col h-full ${
                activeTab === "code" ? "" : "hidden"
              }`}
            >
              {/* Top half */}
              <div className="flex-1 flex flex-row overflow-hidden">
                <div className="h-full w-[250px] border-r border-gray-700 overflow-hidden">
                  <FileExplorer files={files} onFileSelect={setSelectedFile} />
                </div>
                <div className="h-full flex-1 overflow-hidden">
                  <CodeEditor 
                    file={selectedFile} 
                    onSave={handleSaveFile} 
                  />
                </div>
              </div>

              {/* Bottom half */}
              <div
                className={`w-full bg-black transition-all duration-300 ${
                  isTerminalOpen ? "h-[35%]" : "h-0"
                } overflow-hidden border-t border-gray-700`}
              >
                <div ref={terminalEl} className="h-full w-full p-1" />
              </div>
            </div>

            {/* --- PREVIEW VIEW --- */}
            <div
              className={`h-full w-full ${
                activeTab === "preview" ? "" : "hidden"
              }`}
            >
              <Preview url={previewUrl} reloadKey={reloadKey} />
            </div>
          </div>

          {error && (
            <div className="p-2 bg-red-900/30 border-t border-red-700 text-center">
              <p className="text-red-400 font-semibold">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}