import JSZip from "jszip";
import type { WebContainer } from "@webcontainer/api";
import type { FileItem } from "../lib/types";

// Prettier is imported lazily so it never weighs on the builder's initial load.
async function formatCode(content: string, fileName: string): Promise<string> {
  const ext = fileName.split(".").pop()?.toLowerCase();

  try {
    const prettier = await import("prettier/standalone");
    const estree = async () => (await import("prettier/plugins/estree")).default;
    let parser: string;
    let plugins;

    switch (ext) {
      case "ts":
      case "tsx":
        parser = "typescript";
        plugins = [(await import("prettier/plugins/typescript")).default, await estree()];
        break;
      case "js":
      case "jsx":
        parser = "babel";
        plugins = [(await import("prettier/plugins/babel")).default, await estree()];
        break;
      case "json":
        parser = "json";
        plugins = [(await import("prettier/plugins/babel")).default, await estree()];
        break;
      case "css":
        parser = "css";
        plugins = [(await import("prettier/plugins/postcss")).default];
        break;
      case "html":
        parser = "html";
        plugins = [(await import("prettier/plugins/html")).default];
        break;
      case "md":
        parser = "markdown";
        plugins = [(await import("prettier/plugins/markdown")).default];
        break;
      default:
        return content;
    }

    return await prettier.format(content, { parser, plugins });
  } catch (e) {
    console.warn(`Prettier format failed for ${fileName}:`, e);
    return content;
  }
}

async function addFilesToZip(webContainer: WebContainer, items: FileItem[], folder: JSZip) {
  for (const item of items) {
    if (item.type === "folder") {
      const childFolder = folder.folder(item.name);
      if (childFolder && item.children) await addFilesToZip(webContainer, item.children, childFolder);
      continue;
    }

    let content = item.content;
    try {
      content = await webContainer.fs.readFile(item.path, "utf-8");
    } catch (e) {
      console.error(`Failed to read ${item.path}, using in-memory copy:`, e);
    }
    if (content !== undefined) folder.file(item.name, await formatCode(content, item.name));
  }
}

export async function exportProjectZip(webContainer: WebContainer, files: FileItem[]) {
  let projectName = "project";
  try {
    const pkg = JSON.parse(await webContainer.fs.readFile("package.json", "utf-8"));
    projectName = pkg.name || projectName;
  } catch (e) {
    console.warn("Could not read project name from package.json", e);
  }

  const zip = new JSZip();
  await addFilesToZip(webContainer, files, zip);
  const blob = await zip.generateAsync({ type: "blob" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${projectName}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
