// import Loader from "@/app/components/Loader";
// import { Step } from "@/app/lib/types";
// import StepItem from "./StepItem";

// export default function AIChat({ steps, isLoading }: { steps: Step[], isLoading: boolean }) {
//     return (
//         <div className="h-full w-full text-white flex flex-col overflow-hidden  rounded-xl">
//             <style>{`
//                 .no-scrollbar::-webkit-scrollbar { display: none; }
//                 .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
//             `}</style>

//             <div className="flex-1 w-full pt-2 overflow-y-auto no-scrollbar">
//                 {isLoading && steps.length === 0 && (
//                     <div className="flex items-center justify-center p-4 text-zinc-400 h-full">
//                         <Loader />
//                         <span>Creating files....</span>
//                     </div>
//                 )}
//                 {steps.length === 0 && !isLoading && (
//                     <div className="text-center text-zinc-500 pt-8 px-2">No prompt found in storage. Please set a prompt to begin.</div>
//                 )}
//                 {steps.map((step, index) => (
//                     <StepItem key={step.id} step={step} index={index} />
//                 ))}
//                 {isLoading && steps.length > 0 && (
//                     <div className="flex items-center justify-center p-4 text-zinc-400">
//                         <Loader />
//                         <span>Generating next steps...</span>
//                     </div>
//                 )}
//             </div>
//         </div>
//     )
// }



















// adding chat functionality

// import Loader from "@/app/components/Loader";
// import { Step, StepType } from "@/app/lib/types";
// import StepItem from "./StepItem";
// import { User, Sparkles, File as FileIcon, FolderTree, PanelRight, ChevronDown, ChevronUp, ArrowUp } from "lucide-react";
// import { useState } from "react";

// export default function AIChat({ 
//     steps, 
//     isLoading, 
//     prompt,
//     onClose
// }: { 
//     steps: Step[], 
//     isLoading: boolean, 
//     prompt: string | null,
//     onClose: () => void;
// }) {
//     const [isFilesExpanded, setIsFilesExpanded] = useState(false);

//     // Filter steps
//     const fileSteps = steps.filter(s => s.type === StepType.CreateFile || s.type === StepType.CreateFolder);
//     const runSteps = steps.filter(s => s.type === StepType.RunScript);

//     const getFileIcon = (path: string | undefined) => {
//         if (!path) return <FileIcon className="w-4 h-4 text-zinc-400" />;
//         const step = steps.find(s => s.path === path);
//         if (step && step.type === StepType.CreateFolder) {
//             return <FolderTree className="w-4 h-4 text-blue-400" />;
//         }
//         return <FileIcon className="w-4 h-4 text-zinc-400" />;
//     };

//     const getFileName = (path: string | undefined) => {
//         if (!path) return "file";
//         return path.split('/').pop();
//     };

//     return (
//         <div className="h-full w-full text-white flex flex-col overflow-hidden rounded-xl bg-zinc-900">
//             <style>{`
//                 .no-scrollbar::-webkit-scrollbar { display: none; }
//                 .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
//             `}</style>
            
//             <div className="w-full text-white p-3 border-b border-zinc-700 flex-shrink-0 flex items-center justify-between">
//                 <h3 className="font-semibold text-lg">Chat</h3>
//                 <button
//                     onClick={onClose}
//                     className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-md"
//                     title="Close Chat Panel"
//                 >
//                     <PanelRight className="w-5 h-5" />
//                 </button>
//             </div>

//             {/* Chat Area */}
//             <div className="flex-1 w-full overflow-y-auto no-scrollbar space-y-6 p-4">

//                 {/* User Message */}
//                 {prompt && (
//                     <div className="flex items-start gap-3 justify-end">
//                         <div className="flex-1 bg-blue-600 rounded-xl p-3 max-w-[85%]">
//                             <p className="font-semibold text-white">You</p>
//                             <p className="text-white whitespace-pre-wrap">{prompt}</p>
//                         </div>
//                         <div className="flex-shrink-0 bg-zinc-700 rounded-full p-2">
//                             <User className="w-5 h-5 text-white" />
//                         </div>
//                     </div>
//                 )}

//                 {/* AI Message - Generating Files */}
//                 {isLoading && steps.length === 0 && (
//                     <div className="flex items-start gap-3">
//                         <div className="flex-shrink-0 bg-blue-900/50 rounded-full p-2">
//                             <Sparkles className="w-5 h-5 text-blue-300" />
//                         </div>
//                         <div className="flex-1 bg-zinc-800/50 rounded-xl p-3 max-w-[85%]">
//                             <p className="font-semibold text-blue-300">Vision</p>
//                             <div className="flex items-center justify-start p-2 text-zinc-400">
//                                 <Loader />
//                                 <span>Creating files....</span>
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {/* AI Message - Files Created */}
//                 {fileSteps.length > 0 && (
//                     <div className="flex items-start gap-3">
//                         <div className="flex-shrink-0 bg-blue-900/50 rounded-full p-2">
//                             <Sparkles className="w-5 h-5 text-blue-300" />
//                         </div>
//                         <div className="flex-1 bg-zinc-800/50 rounded-xl p-3 space-y-3 max-w-[85%]">
//                             <p className="font-semibold text-blue-300">Vision</p>
//                             <div>
//                                 <p className="text-zinc-300 mb-2 font-medium">I'm creating {fileSteps.length} files:</p>
//                                 <div className="grid grid-cols-2 gap-2">
//                                     {fileSteps.slice(0, isFilesExpanded ? fileSteps.length : 4).map((step) => (
//                                         <div key={step.id} className="flex items-center gap-2 p-2 bg-zinc-700/50 rounded-md overflow-hidden">
//                                             {getFileIcon(step.path)}
//                                             <span className="text-sm text-zinc-200 truncate" title={step.path}>
//                                                 {getFileName(step.path)}
//                                             </span>
//                                         </div>
//                                     ))}
//                                 </div>
//                                 {fileSteps.length > 4 && (
//                                     <button 
//                                         onClick={() => setIsFilesExpanded(!isFilesExpanded)}
//                                         className="text-sm text-blue-400 hover:text-blue-300 mt-2 flex items-center gap-1 cursor-pointer"
//                                     >
//                                         {isFilesExpanded ? 'Show Less' : `Show ${fileSteps.length - 4} More`}
//                                         {isFilesExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
//                                     </button>
//                                 )}
//                             </div>
//                         </div>
//                     </div>
//                 )}
                
//                 {/* AI Message - Other Steps */}
//                 {runSteps.length > 0 && (
//                      <div className="flex items-start gap-3">
//                         <div className="flex-shrink-0 bg-blue-900/50 rounded-full p-2">
//                             <Sparkles className="w-5 h-5 text-blue-300" />
//                         </div>
//                         <div className="flex-1 bg-zinc-800/50 rounded-xl p-3 space-y-2 max-w-[85%]">
//                             <p className="font-semibold text-blue-300">Vision</p>
//                             <p className="text-zinc-300 mb-2 font-medium">And running these steps:</p>
//                             {runSteps.map((step, index) => (
//                                 <StepItem key={step.id} step={step} index={index} />
//                             ))}
//                         </div>
//                     </div>
//                 )}


//                 {/* Loading for next steps */}
//                 {isLoading && steps.length > 0 && (
//                     <div className="flex items-start gap-3">
//                         <div className="flex-shrink-0 bg-blue-900/50 rounded-full p-2">
//                             <Sparkles className="w-5 h-5 text-blue-300" />
//                         </div>
//                         <div className="flex-1 bg-zinc-800/50 rounded-xl p-3 max-w-[85%]">
//                             <p className="font-semibold text-blue-300">Vision</p>
//                             <div className="flex items-center justify-start p-2 text-zinc-400">
//                                 <Loader />
//                                 <span>Generating next steps...</span>
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {steps.length === 0 && !isLoading && !prompt && (
//                     <div className="text-center text-zinc-500 pt-8 px-2">No prompt found in storage. Please set a prompt to begin.</div>
//                 )}
//             </div>

//             {/* Chat Input */}
//             <div className="p-4 border-t border-zinc-700">
//                 <div className="relative flex items-center">
//                     <input
//                         type="text"
//                         placeholder="Send a message..."
//                         className="flex-1 w-full bg-zinc-700 text-white rounded-lg px-4 py-3 pr-12 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                     <button 
//                         className="absolute right-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg p-2 disabled:bg-zinc-600 cursor-pointer"
//                         title="Send"
//                     >
//                         <ArrowUp className="w-5 h-5 text-white" />
//                     </button>
//                 </div>
//             </div>
//         </div>
//     )
// }



























// improved the UI and made the reponse work correctly

import Loader from "@/app/components/Loader";
import { Step, StepType } from "@/app/lib/types";
import StepItem from "./StepItem";
import { User, Sparkles, File as FileIcon, FolderTree, PanelRight, ChevronDown, ChevronUp, ArrowUp } from "lucide-react";
import { useState, useRef, useEffect } from "react";

type ChatMessage = {
  type: 'user' | 'ai';
  content: string;
  steps?: Step[];
};

const AiMessage = ({ content, steps = [] }: { content: string, steps?: Step[] }) => {
    const [isFilesExpanded, setIsFilesExpanded] = useState(false);
    
    const fileSteps = steps.filter(s => s.type === StepType.CreateFile || s.type === StepType.CreateFolder);
    const runSteps = steps.filter(s => s.type === StepType.RunScript);

    const getFileIcon = (path: string | undefined) => {
        if (!path) return <FileIcon className="w-4 h-4 text-zinc-400" />;
        const step = steps.find(s => s.path === path);
        if (step && step.type === StepType.CreateFolder) {
            return <FolderTree className="w-4 h-4 text-blue-400" />;
        }
        return <FileIcon className="w-4 h-4 text-zinc-400" />;
    };

    const getFileName = (path: string | undefined) => {
        if (!path) return "file";
        return path.split('/').pop();
    };

    return (
        <div className="flex items-start gap-3">
            <div className="flex-shrink-0 bg-blue-900/50 rounded-full p-2">
                <Sparkles className="w-5 h-5 text-blue-300" />
            </div>
            <div className="flex-1 bg-zinc-800/50 rounded-xl p-3 space-y-3 max-w-[85%]">
                <p className="font-semibold text-blue-300">Vision</p>
                <p className="text-zinc-300 whitespace-pre-wrap">{content}</p>
                
                {fileSteps.length > 0 && (
                    <div>
                        <div className="grid grid-cols-2 gap-2">
                            {fileSteps.slice(0, isFilesExpanded ? fileSteps.length : 4).map((step) => (
                                <div key={step.id} className="flex items-center gap-2 p-2 bg-zinc-700/50 rounded-md overflow-hidden">
                                    {getFileIcon(step.path)}
                                    <span className="text-sm text-zinc-200 truncate" title={step.path}>
                                        {getFileName(step.path)}
                                    </span>
                                </div>
                            ))}
                        </div>
                        {fileSteps.length > 4 && (
                            <button 
                                onClick={() => setIsFilesExpanded(!isFilesExpanded)}
                                className="text-sm text-blue-400 hover:text-blue-300 mt-2 flex items-center gap-1 cursor-pointer"
                            >
                                {isFilesExpanded ? 'Show Less' : `Show ${fileSteps.length - 4} More`}
                                {isFilesExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                        )}
                    </div>
                )}
                
                {runSteps.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-zinc-700/50 mt-3">
                        {runSteps.map((step, index) => (
                            <StepItem key={step.id} step={step} index={index} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const UserMessage = ({ content }: { content: string }) => {
    return (
        <div className="flex items-start gap-3 justify-end">
            <div className="flex-1 bg-blue-600 rounded-xl p-3 max-w-[85%]">
                <p className="font-semibold text-white">You</p>
                <p className="text-white whitespace-pre-wrap">{content}</p>
            </div>
            <div className="flex-shrink-0 bg-zinc-700 rounded-full p-2">
                <User className="w-5 h-5 text-white" />
            </div>
        </div>
    );
};


export default function AIChat({ 
    chatLog, 
    isLoading, 
    onSendMessage,
    onClose
}: { 
    chatLog: ChatMessage[], 
    isLoading: boolean, 
    onSendMessage: (message: string) => void,
    onClose: () => void;
}) {
    const [newMessage, setNewMessage] = useState("");
    const chatEndRef = useRef<HTMLDivElement>(null);

    const handleSend = () => {
        if (newMessage.trim() && !isLoading) {
            onSendMessage(newMessage);
            setNewMessage("");
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatLog, isLoading]);

    return (
        <div className="h-full w-full text-white flex flex-col overflow-hidden rounded-xl bg-zinc-900">
            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
            
            <div className="w-full text-white p-3 border-b border-zinc-700 flex-shrink-0 flex items-center justify-between">
                <h3 className="font-semibold text-lg">Chat</h3>
                <button
                    onClick={onClose}
                    className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-md"
                    title="Close Chat Panel"
                >
                    <PanelRight className="w-5 h-5" />
                </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 w-full overflow-y-auto no-scrollbar space-y-6 p-4">
                {chatLog.map((msg, index) => {
                    if (msg.type === 'user') {
                        return <UserMessage key={index} content={msg.content} />;
                    }
                    if (msg.type === 'ai') {
                        return <AiMessage key={index} content={msg.content} steps={msg.steps} />;
                    }
                    return null;
                })}

                {isLoading && (
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 bg-blue-900/50 rounded-full p-2">
                            <Sparkles className="w-5 h-5 text-blue-300" />
                        </div>
                        <div className="flex-1 bg-zinc-800/50 rounded-xl p-3 max-w-[85%]">
                            <p className="font-semibold text-blue-300">Vision</p>
                            <div className="flex items-center justify-start p-2 text-zinc-400">
                                <Loader />
                                <span>Generating response...</span>
                            </div>
                        </div>
                    </div>
                )}

                {chatLog.length === 0 && !isLoading && (
                    <div className="text-center text-zinc-500 pt-8 px-2">No prompt found. Please start a new session.</div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-zinc-700">
                <div className="relative flex items-center">
                    <input
                        type="text"
                        placeholder={isLoading ? "Waiting for response..." : "Send a message..."}
                        className="flex-1 w-full bg-zinc-700 text-white rounded-lg px-4 py-3 pr-12 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                    />
                    <button 
                        className="absolute right-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg p-2 disabled:bg-zinc-600 disabled:cursor-not-allowed"
                        title="Send"
                        onClick={handleSend}
                        disabled={isLoading || !newMessage.trim()}
                    >
                        <ArrowUp className="w-5 h-5 text-white" />
                    </button>
                </div>
            </div>
        </div>
    );
}