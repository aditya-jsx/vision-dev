'use client';

interface PreviewProps {
  url: string | null;
  reloadKey: number;
}

export default function Preview({ url, reloadKey }: PreviewProps) {
  if (!url) {
    return (
      <div className="h-full flex items-center justify-center text-zinc-400">
        Waiting for server to start...
      </div>
    );
  }

  return (
    <iframe
      key={reloadKey}
      src={url}
      title="Website Preview"
      className="w-full h-full bg-white"
      sandbox="allow-scripts allow-same-origin"
    />
  );
}