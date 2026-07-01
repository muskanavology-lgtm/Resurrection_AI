const { buildFileTree } = require("../utils/fileTreeCache");

function scanDependencies(projectPathOrTree) {
  const graph = {};

  const tree =
    typeof projectPathOrTree === "string"
      ? buildFileTree(projectPathOrTree).files
      : projectPathOrTree.files || projectPathOrTree;

  const codeExts = [".js", ".jsx", ".ts", ".tsx", ".php"];
  const requireRegex = /require\(['"`](.*?)['"`]\)/g;
  const importRegex = /from\s+['"`](.*?)['"`]/g;

  for (const file of tree) {
    if (!codeExts.includes(file.ext) || !file.content) continue;
    const content = file.content;
    const imports = [];
    let match;

    while ((match = requireRegex.exec(content))) imports.push(match[1]);
    while ((match = importRegex.exec(content))) imports.push(match[1]);

    graph[file.fullPath] = imports;
  }

  return graph;
}

module.exports = scanDependencies;
