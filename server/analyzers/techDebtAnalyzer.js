const { buildFileTree } = require("../utils/fileTreeCache");

function techDebtAnalyzer(projectPathOrTree) {
  const report = {
    maintainabilityScore: 100,
    technicalDebt: "Low",
    duplicateFiles: 0,
    largeFiles: 0,
    deadFiles: 0,
    unusedImports: 0,
    estimatedRefactorTime: "0 Hours",
  };

  const tree =
    typeof projectPathOrTree === "string"
      ? buildFileTree(projectPathOrTree).files
      : projectPathOrTree.files || projectPathOrTree;

  const sizeSeen = new Set();

  for (const file of tree) {
    if (!file.content) continue;
    const content = file.content;
    const lines = content.split("\n").length;

    if (lines > 500) {
      report.largeFiles++;
      report.maintainabilityScore -= 2;
    }

    // NOTE: using content.length as a duplicate-detection key, same approach
    // as the original code. This isn't a true hash, but kept for parity.
    if (sizeSeen.has(content.length)) {
      report.duplicateFiles++;
      report.maintainabilityScore -= 3;
    } else {
      sizeSeen.add(content.length);
    }

    const imports = content.match(/import .* from/g) || [];
    if (imports.length > 20) {
      report.unusedImports++;
      report.maintainabilityScore -= 1;
    }
  }

  if (report.maintainabilityScore < 70) {
    report.technicalDebt = "High";
  } else if (report.maintainabilityScore < 85) {
    report.technicalDebt = "Medium";
  }

  report.estimatedRefactorTime = `${Math.ceil((100 - report.maintainabilityScore) / 5)} Hours`;

  return report;
}

module.exports = techDebtAnalyzer;
