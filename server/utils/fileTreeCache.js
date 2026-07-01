const fs = require("fs");
const path = require("path");
const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  "vendor",
  ".cache",
  "coverage",
  ".vscode",
  ".idea",
  "__pycache__",
  ".venv",
  "venv",
]);

const MAX_FILE_READ_BYTES = 1.5 * 1024 * 1024;
const MAX_FILES = 8000;

function buildFileTree(projectPath) {
  const tree = []; 
  let truncated = false;

  function walk(dir) {
    if (tree.length >= MAX_FILES) {
      truncated = true;
      return;
    }

    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return; 
    }

    for (const entry of entries) {
      if (tree.length >= MAX_FILES) {
        truncated = true;
        return;
      }

      if (entry.name.startsWith(".") && entry.name !== ".env") {
        if (!entry.isDirectory()) continue;
      }

      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name)) continue;
        walk(fullPath);
        continue;
      }

      if (!entry.isFile()) continue;

      let size = 0;
      try {
        size = fs.statSync(fullPath).size;
      } catch {
        continue;
      }

      let content = null;
      const ext = path.extname(entry.name).toLowerCase();
      const isTextLike = [
        ".js", ".jsx", ".ts", ".tsx", ".php", ".py", ".java", ".cs", ".go",
        ".dart", ".rb", ".html", ".htm", ".css", ".scss", ".json", ".env",
        ".yml", ".yaml", ".md", ".txt", ".sql", ".vue", ".svelte",
      ].includes(ext) || entry.name === ".env";

      if (isTextLike && size <= MAX_FILE_READ_BYTES) {
        try {
          content = fs.readFileSync(fullPath, "utf8");
        } catch {
          content = null;
        }
      }

      tree.push({
        fullPath,
        relativePath: path.relative(projectPath, fullPath),
        name: entry.name,
        ext,
        size,
        content, 
      });
    }
  }

  walk(projectPath);

  return { files: tree, truncated, totalScanned: tree.length };
}

module.exports = { buildFileTree, SKIP_DIRS, MAX_FILE_READ_BYTES, MAX_FILES };
