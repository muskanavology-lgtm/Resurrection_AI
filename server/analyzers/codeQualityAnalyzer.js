const { buildFileTree } = require("../utils/fileTreeCache");

function codeQualityAnalyzer(projectPathOrTree) {
  const report = {
    totalFiles: 0,
    largeFiles: [],
    longFunctions: [],
    unusedImports: [],
    complexity: "LOW",
    maintainability: "95%",
  };

  const tree =
    typeof projectPathOrTree === "string"
      ? buildFileTree(projectPathOrTree).files
      : projectPathOrTree.files || projectPathOrTree;

  const codeExts = [".js", ".jsx", ".ts", ".tsx"];

  for (const file of tree) {
    if (!codeExts.includes(file.ext)) continue;
    report.totalFiles++;
    if (!file.content) continue;

    const content = file.content;
    const lines = content.split("\n");

    if (lines.length > 500) {
      report.largeFiles.push({ file: file.relativePath, lines: lines.length });
    }

    const functions = content.match(/function\s+[a-zA-Z0-9_]+/g) || [];
    if (functions.length > 20) {
      report.longFunctions.push({ file: file.relativePath, count: functions.length });
    }

    const imports = content.match(/require\(.+\)|import.+from/g) || [];
    if (imports.length > 30) {
      report.unusedImports.push({ file: file.relativePath, imports: imports.length });
    }
  }

  const totalIssues = report.largeFiles.length + report.longFunctions.length + report.unusedImports.length;

  if (totalIssues > 20) {
    report.complexity = "HIGH";
    report.maintainability = "60%";
  } else if (totalIssues > 10) {
    report.complexity = "MEDIUM";
    report.maintainability = "75%";
  }

  return report;
}

module.exports = codeQualityAnalyzer;
