// Normalizes a model-supplied file path to a relative path inside the project.
// Returns null for anything that could escape the project root.
export function safePath(raw: string | undefined): string | null {
  if (!raw) return null;
  const parts = raw.trim().replace(/\\/g, "/").split("/").filter((p) => p && p !== ".");
  if (parts.length === 0 || parts.includes("..") || /^[a-zA-Z]:$/.test(parts[0])) return null;
  return parts.join("/");
}
