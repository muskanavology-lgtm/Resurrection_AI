const { buildFileTree } = require("../utils/fileTreeCache");

function executionFlowAnalyzer(projectPathOrTree) {
  const flow = [];

  const tree =
    typeof projectPathOrTree === "string"
      ? buildFileTree(projectPathOrTree).files
      : projectPathOrTree.files || projectPathOrTree;

  for (const file of tree) {
    const lower = file.name.toLowerCase();
    const content = file.content || "";

    if (content.includes("router.") || content.includes("express.Router")) {
      flow.push({ type: "Route", file: file.relativePath });
    }
    if (lower.includes("controller")) {
      flow.push({ type: "Controller", file: file.relativePath });
    }
    if (lower.includes("service")) {
      flow.push({ type: "Service", file: file.relativePath });
    }
    if (lower.includes("model")) {
      flow.push({ type: "Model", file: file.relativePath });
    }
    if (file.ext === ".jsx" || file.ext === ".tsx") {
      flow.push({ type: "React Component", file: file.relativePath });
    }
    if (file.ext === ".html" || file.ext === ".htm") {
      flow.push({ type: "Frontend Page", file: file.relativePath });
    }
    if (file.ext === ".php") {
      flow.push({ type: "PHP Module", file: file.relativePath });
    }
    if (file.ext === ".py") {
      flow.push({ type: "Python Module", file: file.relativePath });
    }
    if (file.ext === ".java") {
      flow.push({ type: "Java Class", file: file.relativePath });
    }
  }
  return flow;
}
module.exports = executionFlowAnalyzer;
