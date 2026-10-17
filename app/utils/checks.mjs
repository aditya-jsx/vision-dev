// Run: node app/utils/checks.mjs
import assert from "node:assert/strict";
import { safePath } from "./safePath.ts";
import { insertPath, updateFileContent } from "./fileTree.ts";

assert.equal(safePath("src/App.tsx"), "src/App.tsx");
assert.equal(safePath("./src//App.tsx"), "src/App.tsx");
assert.equal(safePath("/package.json"), "package.json");
assert.equal(safePath("src\\main.tsx"), "src/main.tsx");
assert.equal(safePath("../etc/passwd"), null);
assert.equal(safePath("src/../../x"), null);
assert.equal(safePath("C:/Windows/x"), null);
assert.equal(safePath(""), null);
assert.equal(safePath(undefined), null);

let tree = insertPath([], "package.json", "file", "{}");
tree = insertPath(tree, "src/components/Button.tsx", "file", "a");
tree = insertPath(tree, "src/App.tsx", "file", "b");
const before = tree;
tree = insertPath(tree, "src/App.tsx", "file", "c");
assert.deepEqual(tree.map((n) => n.name), ["package.json", "src"]);
const src = tree[1];
assert.equal(src.type, "folder");
assert.equal(src.path, "src");
assert.deepEqual(src.children.map((n) => n.path), ["src/components", "src/App.tsx"]);
assert.equal(src.children[1].content, "c");
assert.equal(before[1].children[1].content, "b", "insertPath must not mutate the old tree");
assert.equal(insertPath(tree, "package.json/x", "file", "").length, 2, "file/folder conflict is ignored");
assert.equal(updateFileContent(tree, "src/components/Button.tsx", "z")[1].children[0].children[0].content, "z");

console.log("checks ok");
