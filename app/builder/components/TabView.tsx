import { Code2, Eye, Terminal as TerminalIcon, RefreshCw, ChevronUp, ChevronDown } from "lucide-react";

export type BuilderTab = "code" | "preview";

export function TabView({
  activeTab,
  onTabChange,
  onReloadPreview,
  isTerminalOpen,
  onToggleTerminal,
}: {
  activeTab: BuilderTab;
  onTabChange: (tab: BuilderTab) => void;
  onReloadPreview: () => void;
  isTerminalOpen: boolean;
  onToggleTerminal: () => void;
}) {
  return (
    <div className="flex h-12 shrink-0 items-center gap-2 border-b border-white/[0.06] px-3">
      {/* Segmented tabs */}
      <div className="relative flex rounded-lg bg-white/[0.04] p-0.5 ring-1 ring-white/[0.06]">
        <span
          className="absolute inset-y-0.5 w-[calc(50%-2px)] rounded-md bg-white/10 shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ transform: activeTab === "code" ? "translateX(0)" : "translateX(100%)" }}
        />
        {(["code", "preview"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`relative z-10 flex w-24 cursor-pointer items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium capitalize transition-colors ${
              activeTab === tab ? "text-white" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tab === "code" ? <Code2 className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-grow" />

      {activeTab === "preview" && (
        <button
          onClick={onReloadPreview}
          title="Reload Preview"
          className="cursor-pointer rounded-md p-2 text-zinc-500 transition-colors hover:bg-white/5 hover:text-white"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      )}

      {activeTab === "code" && (
        <button
          onClick={onToggleTerminal}
          className={`flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            isTerminalOpen ? "bg-white/10 text-white" : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
          }`}
        >
          <TerminalIcon className="h-3.5 w-3.5" />
          Terminal
          {isTerminalOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
        </button>
      )}
    </div>
  );
}
