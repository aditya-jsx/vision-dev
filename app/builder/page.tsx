"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Play, Download, PanelLeft } from "lucide-react";
import AIChat from "./components/AIChat";
import { FileExplorer } from "./components/FileExplorer";
import { CodeEditor } from "./components/CodeEditor";
import Preview from "./components/Preview";
import { TabView, BuilderTab } from "./components/TabView";
import { useStepRunner } from "./hooks/useStepRunner";
import { useProjectChat } from "./hooks/useProjectChat";
import { useWebContainer } from "../hooks/useWebContainer";
import { FileItem } from "../lib/types";
import { exportProjectZip } from "../utils/exportZip";
import Loader from "../components/Loader";

export default function Builder() {
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [activeTab, setActiveTab] = useState<BuilderTab>("code");
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isChatPanelOpen, setIsChatPanelOpen] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  const { webContainer, terminalEl, previewUrl, inputWriter, refitTerminal } = useWebContainer();
  const { files, isFileSystemReady, addSteps, saveFile, runApp } = useStepRunner(webContainer, inputWriter, setError);
  const { chatLog, isLoading, sendMessage } = useProjectChat(addSteps, setError);

  const isWebContainerBooted = !!webContainer;
  const isShellReady = !!inputWriter;

  useEffect(() => {
    if (isTerminalOpen && activeTab === "code") {
      const timer = setTimeout(refitTerminal, 350);
      return () => clearTimeout(timer);
    }
  }, [isTerminalOpen, refitTerminal, activeTab]);

  const changeTab = (tab: BuilderTab) => {
    setActiveTab(tab);
    if (tab === "preview") setIsTerminalOpen(false);
  };

  // Jump to the preview when the dev server comes up.
  const [seenPreviewUrl, setSeenPreviewUrl] = useState(previewUrl);
  if (previewUrl !== seenPreviewUrl) {
    setSeenPreviewUrl(previewUrl);
    if (previewUrl) changeTab("preview");
  }

  const handleRun = async () => {
    setIsTerminalOpen(true);
    setError(null);
    await runApp();
  };

  const handleReloadPreview = () => setReloadKey((prev) => prev + 1);

  const handleSaveFile = async (path: string, content: string) => {
    if (await saveFile(path, content)) {
      setSelectedFile((prev) => (prev?.path === path ? { ...prev, content } : prev));
    }
  };

  const handleExportCode = async () => {
    if (!webContainer) {
      setError("WebContainer not ready.");
      return;
    }
    try {
      setError(null);
      await exportProjectZip(webContainer, files);
    } catch (e) {
      setError(`Failed to create zip file: ${e instanceof Error ? e.message : e}`);
    }
  };

  const runState = !isWebContainerBooted
    ? "Booting"
    : !isFileSystemReady
    ? "Writing files"
    : !isShellReady
    ? "Booting shell"
    : previewUrl
    ? "Live"
    : "Ready";

  return (
    <div className="flex h-screen w-full flex-col bg-[#05060a] text-white">
      {/* Ambient glow */}
      <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,rgba(99,102,241,0.12),transparent)]" />

      {/* --- Top bar --- */}
      <header className="relative flex h-14 shrink-0 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2" title="Back to dashboard">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-indigo-400 to-cyan-300 shadow-[0_0_20px_-4px_rgba(99,102,241,0.8)]">
              <Eye className="h-4 w-4 text-[#05060a]" strokeWidth={2.5} />
            </span>
            <span className="font-semibold tracking-tight">Vision</span>
          </Link>
          <span className="text-zinc-700">/</span>
          <span className="max-w-[40vw] truncate text-sm text-zinc-400">
            {chatLog[0]?.content || "New project"}
          </span>
          <span
            className={`hidden items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 sm:flex ${
              runState === "Live"
                ? "bg-emerald-400/10 text-emerald-300 ring-emerald-400/20"
                : runState === "Ready"
                ? "bg-indigo-400/10 text-indigo-300 ring-indigo-400/20"
                : "bg-amber-400/10 text-amber-300 ring-amber-400/20"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full bg-current ${runState === "Live" || runState === "Ready" ? "" : "animate-pulse"}`} />
            {runState}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCode}
            disabled={!isWebContainerBooted || files.length === 0}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-zinc-300 transition-colors hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={handleRun}
            disabled={!isWebContainerBooted || !isFileSystemReady || !isShellReady}
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-white px-3.5 py-1.5 text-sm font-semibold text-black transition-all hover:bg-zinc-200 active:scale-95 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-zinc-400"
          >
            {runState === "Ready" || runState === "Live" ? (
              <>
                <Play className="h-3.5 w-3.5 fill-current" /> Run
              </>
            ) : (
              <>
                <Loader />
                <span>{runState}...</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* --- Main Content Area --- */}
      <div className={`relative flex min-h-0 w-full flex-1 px-2 pb-2 transition-all duration-500 ease-in-out ${isChatPanelOpen ? "gap-2" : "gap-0"}`}>

        {/* Chat Panel */}
        <div className={`h-full overflow-hidden rounded-2xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isChatPanelOpen ? "w-[30%] min-w-[320px] border border-white/[0.06]" : "w-0 min-w-0 border-0"}`}>
          <AIChat
            chatLog={chatLog}
            isLoading={isLoading}
            onSendMessage={sendMessage}
            onClose={() => setIsChatPanelOpen(false)}
          />
        </div>

        {/* Code / Preview + Terminal */}
        <div className="relative flex h-full min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0a0b11] transition-all duration-500 ease-in-out">
          <div className="flex items-center">
            {!isChatPanelOpen && (
              <button
                onClick={() => setIsChatPanelOpen(true)}
                className="ml-3 cursor-pointer rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-white/5 hover:text-white"
                title="Open Chat"
              >
                <PanelLeft className="h-4 w-4" />
              </button>
            )}
            <div className="flex-1">
              <TabView
                activeTab={activeTab}
                onTabChange={changeTab}
                onReloadPreview={handleReloadPreview}
                isTerminalOpen={isTerminalOpen}
                onToggleTerminal={() => setIsTerminalOpen(!isTerminalOpen)}
              />
            </div>
          </div>

          <div className="flex flex-1 flex-col overflow-hidden">

            {/* Explorer + Editor + Terminal */}
            <div className={`flex h-full flex-col ${activeTab === "code" ? "" : "hidden"}`}>
              <div className="flex flex-1 flex-row overflow-hidden">
                <div className="h-full w-[240px] shrink-0 overflow-hidden border-r border-white/[0.06] bg-black/20">
                  <FileExplorer files={files} onFileSelect={setSelectedFile} selectedPath={selectedFile?.path} />
                </div>
                <div className="h-full flex-1 overflow-hidden">
                  <CodeEditor file={selectedFile} onSave={handleSaveFile} />
                </div>
              </div>

              {/* Terminal */}
              <div
                className={`w-full overflow-hidden border-t border-white/[0.06] bg-[#06070b] transition-all duration-300 ${
                  isTerminalOpen ? "h-[35%]" : "h-0 border-t-0"
                }`}
              >
                <div ref={terminalEl} className="h-full w-full p-2" />
              </div>
            </div>

            {/* --- PREVIEW VIEW --- */}
            <div className={`h-full w-full ${activeTab === "preview" ? "" : "hidden"}`}>
              <Preview url={previewUrl} reloadKey={reloadKey} />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 border-t border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-300">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
              <p className="truncate">{error}</p>
              <button onClick={() => setError(null)} className="ml-auto cursor-pointer text-xs text-red-300/70 hover:text-red-200">
                Dismiss
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
