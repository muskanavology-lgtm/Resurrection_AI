const { buildFileTree } = require("../utils/fileTreeCache");

function refactorAnalyzer(projectPathOrTree) {
  const report = [];

  const tree =
    typeof projectPathOrTree === "string"
      ? buildFileTree(projectPathOrTree).files
      : projectPathOrTree.files || projectPathOrTree;

  for (const file of tree) {
    if (!file.content) continue;
    const content = file.content;
    const lines = content.split("\n");

    if (lines.length > 500) {
      report.push({
        file: file.relativePath,
        severity: "HIGH",
        issue: "Large File",
        recommendation: "Split into modules",
      });
    }

    const functions = content.match(/function\s+[a-zA-Z0-9_]+/g) || [];
    if (functions.length > 15) {
      report.push({
        file: file.relativePath,
        severity: "HIGH",
        issue: "God File",
        recommendation: "Move logic into services",
      });
    }
  }

  return report;
}

module.exports = refactorAnalyzer;
