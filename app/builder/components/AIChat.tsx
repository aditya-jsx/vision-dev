import { Step, StepType } from "@/app/lib/types";
import StepItem from "./StepItem";
import { Eye, File as FileIcon, FolderTree, PanelLeftClose, ChevronDown, ChevronUp, ArrowUp } from "lucide-react";
import { useState, useRef, useEffect } from "react";

type ChatMessage = {
  type: 'user' | 'ai';
  content: string;
  steps?: Step[];
};

const VisionAvatar = () => (
    <div className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-lg bg-gradient-to-br from-indigo-400 to-cyan-300">
        <Eye className="h-3.5 w-3.5 text-[#05060a]" strokeWidth={2.5} />
    </div>
);

const AiMessage = ({ content, steps = [] }: { content: string, steps?: Step[] }) => {
    const [isFilesExpanded, setIsFilesExpanded] = useState(false);

    const fileSteps = steps.filter(s => s.type === StepType.CreateFile || s.type === StepType.CreateFolder);
    const runSteps = steps.filter(s => s.type === StepType.RunScript);

    const getFileIcon = (path: string | undefined) => {
        if (!path) return <FileIcon className="w-3.5 h-3.5 shrink-0 text-zinc-500" />;
        const step = steps.find(s => s.path === path);
        if (step && step.type === StepType.CreateFolder) {
            return <FolderTree className="w-3.5 h-3.5 shrink-0 text-indigo-300" />;
        }
        return <FileIcon className="w-3.5 h-3.5 shrink-0 text-zinc-500" />;
    };

    const getFileName = (path: string | undefined) => {
        if (!path) return "file";
        return path.split('/').pop();
    };

    const doneCount = fileSteps.filter(s => s.status === "completed").length;

    return (
        <div className="flex items-start gap-3 animate-[fadeUp_0.4s_ease-out]">
            <VisionAvatar />
            <div className="min-w-0 flex-1 space-y-3">
                <p className="text-sm leading-relaxed text-zinc-300 whitespace-pre-wrap">{content}</p>

                {fileSteps.length > 0 && (
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-2">
                        <div className="mb-2 flex items-center justify-between px-1 text-[11px] text-zinc-500">
                            <span>{fileSteps.length} files</span>
                            <span>{doneCount}/{fileSteps.length} written</span>
                        </div>
                        <div className="mb-2 h-0.5 overflow-hidden rounded-full bg-white/5">
                            <div className="h-full bg-gradient-to-r from-indigo-400 to-cyan-300 transition-all duration-500" style={{ width: `${(doneCount / fileSteps.length) * 100}%` }} />
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                            {fileSteps.slice(0, isFilesExpanded ? fileSteps.length : 4).map((step) => (
                                <div key={step.id} className="flex items-center gap-2 rounded-md bg-white/[0.03] px-2 py-1.5 overflow-hidden">
                                    {getFileIcon(step.path)}
                                    <span className="font-mono text-xs text-zinc-300 truncate" title={step.path}>
                                        {getFileName(step.path)}
                                    </span>
                                </div>
                            ))}
                        </div>
                        {fileSteps.length > 4 && (
                            <button
                                onClick={() => setIsFilesExpanded(!isFilesExpanded)}
                                className="mt-1 flex w-full items-center justify-center gap-1 rounded-md py-1 text-xs text-zinc-500 hover:bg-white/[0.03] hover:text-zinc-300 cursor-pointer"
                            >
                                {isFilesExpanded ? 'Show less' : `Show ${fileSteps.length - 4} more`}
                                {isFilesExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                        )}
                    </div>
                )}

                {runSteps.length > 0 && (
                    <div className="space-y-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-2">
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
        <div className="flex justify-end animate-[fadeUp_0.4s_ease-out]">
            <div className="max-w-[85%] rounded-2xl rounded-tr-md bg-gradient-to-br from-indigo-500 to-indigo-600 px-4 py-2.5 text-sm leading-relaxed text-white shadow-lg shadow-indigo-950/50 whitespace-pre-wrap">
                {content}
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

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatLog, isLoading]);

    return (
        <div className="h-full w-full text-white flex flex-col overflow-hidden bg-[#0a0b11]">
            <style>{`
                @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
            `}</style>

            <div className="flex h-12 flex-shrink-0 items-center justify-between border-b border-white/[0.06] px-4">
                <h3 className="text-sm font-medium text-zinc-200">Chat</h3>
                <button
                    onClick={onClose}
                    className="cursor-pointer rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-white/5 hover:text-white"
                    title="Close Chat Panel"
                >
                    <PanelLeftClose className="w-4 h-4" />
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
                    <div className="flex items-center gap-3">
                        <VisionAvatar />
                        <div className="flex items-center gap-1.5 rounded-full bg-white/[0.04] px-3 py-2">
                            {[0, 150, 300].map((d) => (
                                <span key={d} className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-300" style={{ animationDelay: `${d}ms` }} />
                            ))}
                            <span className="ml-1.5 text-xs text-zinc-400">Generating</span>
                        </div>
                    </div>
                )}

                {chatLog.length === 0 && !isLoading && (
                    <div className="text-center text-sm text-zinc-500 pt-8 px-2">No prompt found. Please start a new session.</div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-3">
                <div className="flex items-end gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] p-1.5 transition-colors focus-within:border-indigo-400/40 focus-within:bg-white/[0.05]">
                    <textarea
                        rows={1}
                        placeholder={isLoading ? "Waiting for response..." : "Ask for a change..."}
                        aria-label="Message Vision"
                        className="max-h-32 min-h-9 flex-1 resize-none bg-transparent px-2.5 py-2 text-sm text-white placeholder-zinc-500 outline-none field-sizing-content"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading}
                    />
                    <button
                        className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-lg bg-white text-black transition-all hover:bg-zinc-200 active:scale-95 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-zinc-500"
                        title="Send"
                        onClick={handleSend}
                        disabled={isLoading || !newMessage.trim()}
                    >
                        <ArrowUp className="w-4 h-4" />
                    </button>
                </div>
                <p className="mt-2 text-center text-[11px] text-zinc-600">Enter to send · Shift + Enter for a new line</p>
            </div>
        </div>
    );
}
