const { buildFileTree } = require("../utils/fileTreeCache");

function extractRoutes(projectPathOrTree) {
  const routes = [];

  const tree =
    typeof projectPathOrTree === "string"
      ? buildFileTree(projectPathOrTree).files
      : projectPathOrTree.files || projectPathOrTree;

  const regex = /router\.(get|post|put|delete|patch)\s*\(\s*["'`](.*?)["'`]/g;
  // Laravel-style route definitions: Route::get('/path', ...)
  const laravelRegex = /Route::(get|post|put|delete|patch)\s*\(\s*['"`](.*?)['"`]/g;

  for (const file of tree) {
    if (![".js", ".ts", ".php"].includes(file.ext) || !file.content) continue;
    const content = file.content;
    let match;

    while ((match = regex.exec(content)) !== null) {
      routes.push({ method: match[1].toUpperCase(), path: match[2], file: file.relativePath });
    }

    while ((match = laravelRegex.exec(content)) !== null) {
      routes.push({ method: match[1].toUpperCase(), path: match[2], file: file.relativePath });
    }
  }

  return routes;
}

module.exports = extractRoutes;
