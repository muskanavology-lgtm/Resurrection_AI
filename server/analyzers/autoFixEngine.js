const { buildFileTree } = require("../utils/fileTreeCache");

function autoFixEngine(projectPathOrTree) {
  const fixes = [];

  const tree =
    typeof projectPathOrTree === "string"
      ? buildFileTree(projectPathOrTree).files
      : projectPathOrTree.files || projectPathOrTree;

  for (const file of tree) {
    if (!file.content) continue;
    const content = file.content;

    if (content.includes("jwt.sign(") && content.includes("secret")) {
      fixes.push({
        file: file.relativePath,
        severity: "HIGH",
        issue: "Hardcoded JWT Secret",
        fix: "Move secret to .env",
      });
    }

    if (content.includes("async") && !content.includes("catch")) {
      fixes.push({
        file: file.relativePath,
        severity: "MEDIUM",
        issue: "Missing Error Handling",
        fix: "Add try/catch block",
      });
    }

    if (content.includes("password") && !content.includes("bcrypt")) {
      fixes.push({
        file: file.relativePath,
        severity: "HIGH",
        issue: "Password may not be encrypted",
        fix: "Use bcrypt.hash()",
      });
    }
  }

  return fixes;
}

module.exports = autoFixEngine;
