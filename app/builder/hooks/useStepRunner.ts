import { useCallback, useEffect, useRef, useState } from "react";
import type { WebContainer } from "@webcontainer/api";
import { Step, StepType, FileItem } from "../../lib/types";
import { insertPath, updateFileContent } from "../../utils/fileTree";

type ShellWriter = WritableStreamDefaultWriter<string> | null;

const errorMessage = (e: unknown) => (e instanceof Error ? e.message : String(e));

// Owns the step list and the file tree. Pending steps are written into the
// WebContainer strictly one at a time, in order.
export function useStepRunner(
  webContainer: WebContainer | null,
  inputWriter: ShellWriter,
  onError: (message: string) => void
) {
  const [steps, setSteps] = useState<Step[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const nextId = useRef(1);
  // Steps waiting to be written. A ref so steps added mid-drain are picked up by the running loop.
  const queue = useRef<Step[]>([]);
  const draining = useRef(false);

  // Queues steps and shows their files in the tree right away, before they are written.
  // Returns the steps with their assigned ids.
  const addSteps = useCallback((newSteps: Step[]) => {
    // Shell steps are not auto-run; the user starts the app with Run.
    const withIds = newSteps.map((step) => ({
      ...step,
      id: nextId.current++,
      status: step.type === StepType.RunScript ? ("completed" as const) : step.status,
    }));
    queue.current.push(...withIds.filter((s) => s.status === "pending"));
    setSteps((prev) => [...prev, ...withIds]);
    setFiles((tree) =>
      withIds
        .filter((s) => s.type === StepType.CreateFile && s.path)
        .sort((a, b) => a.path!.split("/").length - b.path!.split("/").length)
        .reduce((t, s) => insertPath(t, s.path!, "file", s.code), tree)
    );
    return withIds;
  }, []);

  const setStatus = useCallback(
    (id: number, status: Step["status"], description?: string) =>
      setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, status, ...(description && { description }) } : s))),
    []
  );

  const drain = useCallback(async () => {
    if (!webContainer || draining.current) return;
    draining.current = true;
    while (queue.current.length) {
      const step = queue.current.shift()!;
      setStatus(step.id, "in-progress");
      try {
        if (step.path) {
          const parts = step.path.split("/");
          if (parts.length > 1) await webContainer.fs.mkdir(parts.slice(0, -1).join("/"), { recursive: true });
          if (step.type === StepType.CreateFile) await webContainer.fs.writeFile(step.path, step.code || "");
        }
        setStatus(step.id, "completed");
      } catch (e) {
        onError(`Failed at step: ${step.title} - ${errorMessage(e)}`);
        setStatus(step.id, "failed", errorMessage(e));
      }
    }
    draining.current = false;
  }, [webContainer, onError, setStatus]);

  // Runs on new steps and once the WebContainer boots.
  useEffect(() => {
    drain();
  }, [steps, drain]);

  const fileSteps = steps.filter((s) => s.type === StepType.CreateFile || s.type === StepType.CreateFolder);
  const isFileSystemReady = fileSteps.length > 0 && fileSteps.every((s) => s.status === "completed");

  const saveFile = useCallback(
    async (path: string, content: string) => {
      if (!webContainer) return false;
      try {
        await webContainer.fs.writeFile(path, content);
        setFiles((tree) => updateFileContent(tree, path, content));
        return true;
      } catch (e) {
        onError(`Failed to save file: ${errorMessage(e)}`);
        return false;
      }
    },
    [webContainer, onError]
  );

  const runApp = useCallback(async () => {
    if (!inputWriter) {
      onError("WebContainer is not ready. Please wait.");
      return;
    }
    try {
      await inputWriter.write("npm install\n");
      await inputWriter.write("npm run dev\n");
    } catch (e) {
      onError(`Failed to run commands: ${errorMessage(e)}`);
    }
  }, [inputWriter, onError]);

  return { steps, files, isFileSystemReady, addSteps, saveFile, runApp };
}
