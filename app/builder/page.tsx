"use client"

import React, { useEffect, useState } from "react";
import axios from "axios";
import  AIChat  from "./components/AIChat";
import { FileExplorer } from "./components/FileExplorer";
import { Step, StepType, FileItem } from "../lib/types";
import { parseXml } from "../utils/parseXml";
const BACKEND_URL = "http://localhost:3000";
import { Code2, Eye, Terminal as TerminalIcon, Play } from "lucide-react";
import { CodeEditor } from "./components/CodeEditor";
import { useWebContainer } from "../hooks/useWebContainer";
import Preview from "./components/Preview";

function TabView({ activeTab, onTabChange }: { activeTab: 'code' | 'preview' | 'terminal'; onTabChange: (tab: 'code' | 'preview' | 'terminal') => void; }) {
    return (
        <div className="flex space-x-2 mb-2 px-2 pt-2">
            <button
                onClick={() => onTabChange('code')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-colors ${
                    activeTab === 'code' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:bg-zinc-800'
                }`}
            >
                <Code2 className="w-4 h-4" /> Code
            </button>
            <button
                onClick={() => onTabChange('preview')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-colors ${
                    activeTab === 'preview' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:bg-zinc-800'
                }`}
            >
                <Eye className="w-4 h-4" /> Preview
            </button>
            <button
                onClick={() => onTabChange('terminal')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-colors ${
                    activeTab === 'terminal' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:bg-zinc-800'
                }`}
            >
                <TerminalIcon className="w-4 h-4" /> Terminal
            </button>
        </div>
    );
}


export default function Builder() {
    const [steps, setSteps] = useState<Step[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [files, setFiles] = useState<FileItem[]>([]);
    const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
    const [activeTab, setActiveTab] = useState<'code' | 'preview' | 'terminal'>('code');
    const { webContainer, terminalEl, previewUrl } = useWebContainer();

    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        const processSteps = async () => {
            const pendingSteps = steps.filter(s => s.status === 'pending');
            if (pendingSteps.length === 0 || !webContainer) return;

            for (const step of pendingSteps) {
                await executeStep(step);
            }
        };

        processSteps();
    }, [steps, webContainer]);

    const executeStep = async (step: Step) => {
        if (!webContainer) return;

        switch (step.type) {
            case StepType.CreateFile:
                await createFileOrFolder(step);
                break;
            case StepType.RunScript:
                if (step.code) {
                    const [command, ...args] = step.code.split(' ');
                    const process = await webContainer.spawn(command, args);
                    await process.exit;
                }
                break;
        }

        setSteps(currentSteps =>
            currentSteps.map(s => (s.id === step.id ? { ...s, status: 'completed' } : s))
        );
    };

    const createFileOrFolder = async (step: Step) => {
        if (!step.path || !webContainer) return;

        const pathParts = step.path.split('/').filter(p => p);
        if (pathParts.length > 1) {
            const dirPath = pathParts.slice(0, -1).join('/');
            await webContainer.fs.mkdir(dirPath, { recursive: true });
        }

        if (step.type === StepType.CreateFile) {
            await webContainer.fs.writeFile(step.path, step.code || '');
        }

        setFiles(currentFiles => {
            const newFileTree = JSON.parse(JSON.stringify(currentFiles));
            let currentLevel = newFileTree;

            for (let i = 0; i < pathParts.length; i++) {
                const part = pathParts[i];
                const currentPath = pathParts.slice(0, i + 1).join('/');
                const isLastPart = i === pathParts.length - 1;
                let existingNode = currentLevel.find((node: FileItem) => node.name === part);

                if (existingNode) {
                    if (existingNode.type === 'folder' && !isLastPart) {
                        currentLevel = existingNode.children!;
                    } else if (existingNode.type === 'file' && isLastPart) {
                        existingNode.content = step.code;
                    }
                } else {
                    if (isLastPart && step.type === StepType.CreateFile) {
                        currentLevel.push({ name: part, type: 'file', path: currentPath, content: step.code });
                    } else {
                        const newFolder: FileItem = { name: part, type: 'folder', path: currentPath, children: [] };
                        currentLevel.push(newFolder);
                        if (!isLastPart) {
                            currentLevel = newFolder.children!;
                        }
                    }
                }
            }
            return newFileTree;
        });
    };

    const handleRun = async () => {
        if (!webContainer) return;
        setActiveTab('terminal');

        const installProcess = await webContainer.spawn('npm', ['install']);
        await installProcess.exit;

        const devProcess = await webContainer.spawn('npm', ['run', 'dev']);
        // The dev process will continue to run in the background
    };

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
            const skeletonResponse = await axios.post(`${BACKEND_URL}/api/skeleton`, { prompt: prompt.trim() });
            const { prompts, uiPrompt } = skeletonResponse.data;
            
            if (!prompts || !uiPrompt || !uiPrompt[0]) throw new Error("Invalid response from skeleton API.");
            
            const initialSteps = parseXml(uiPrompt[0]);
            setSteps(initialSteps);

            const messages = [...prompts, prompt].map(content => ({ role: "user", parts: [{ text: content }] }));
            const stepsResponse = await axios.post(`${BACKEND_URL}/api/chat`, { messages });
            const detailedStepsXml = stepsResponse.data.output;
            if (!detailedStepsXml) throw new Error("Invalid response from detailed steps API.");

            const detailedSteps = parseXml(detailedStepsXml);
            setSteps(currentSteps => [...currentSteps, ...detailedSteps]);
        } catch (err: any) {
            setError(err.message || "An error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen w-full bg-zinc-950 flex flex-col items-center justify-center">
            <div className="h-[7%] w-full border-b border-gray-700 flex items-center justify-between px-4">
                <button 
                  onClick={handleRun}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-500 flex items-center gap-2"
                >
                    <Play className="w-4 h-4" /> Run
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
                <div className="h-full w-[53%] flex flex-col border border-gray-700 rounded-xl overflow-hidden">
                    <TabView activeTab={activeTab} onTabChange={setActiveTab} />
                    <div className="flex-1 bg-transparent rounded-b-lg">
                        {activeTab === 'code' && <CodeEditor file={selectedFile} />}
                        {activeTab === 'preview' && <Preview url={previewUrl} />}
                        {activeTab === 'terminal' && <div ref={terminalEl} className="h-full w-full"></div>}
                    </div>
                     {error && (
                        <div className="mt-2 p-2 bg-red-900/30 border border-red-700 rounded-lg text-center">
                            <p className="text-red-400 font-semibold">{error}</p>
                        </div>
                     )}
                </div>
            </div>
        </div>
    );
}