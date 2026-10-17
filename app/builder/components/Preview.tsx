'use client';

import { Globe, Loader2 } from 'lucide-react';

interface PreviewProps {
  url: string | null;
  reloadKey: number;
}

export default function Preview({ url, reloadKey }: PreviewProps) {
  if (!url) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 text-zinc-500 bg-[radial-gradient(ellipse_50%_40%_at_50%_45%,rgba(99,102,241,0.08),transparent)]">
        <div className="relative grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/[0.03]">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-300" />
        </div>
        <div className="text-center">
          <p className="text-sm text-zinc-300">Waiting for the dev server</p>
          <p className="mt-1 text-xs">Press Run once files are written to start it.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-9 shrink-0 items-center gap-2 border-b border-white/[0.06] px-3">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md bg-white/[0.04] px-3 py-1 font-mono text-xs text-zinc-400">
          <Globe className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
          <span className="truncate">{url}</span>
        </div>
      </div>
      <iframe
        key={reloadKey}
        src={url}
        title="Website Preview"
        className="w-full flex-1 bg-white"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}
