const { buildFileTree } = require("../utils/fileTreeCache");

/*
  FIX: ab ye apna disk walk nahi karta — pre-built file tree (jo upload
  controller ek baar banata hai) ko accept karta hai. Agar koi purana
  caller ab bhi sirf `projectPath` (string) pass kare, to backward
  compatibility ke liye hum khud tree bana lete hain — par naya
  uploadController.js seedha tree pass karega taaki dobara scan na ho.
*/

function securityScanner(projectPathOrTree) {
  const report = {
    securityScore: 100,
    grade: "A",
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    issues: [],
    recommendations: [],
  };

  function addIssue(severity, file, message) {
    report.issues.push({ severity, file, message });
    if (severity === "critical") {
      report.critical++;
      report.securityScore -= 15;
    }
    if (severity === "high") {
      report.high++;
      report.securityScore -= 8;
    }
    if (severity === "medium") {
      report.medium++;
      report.securityScore -= 4;
    }
    if (severity === "low") {
      report.low++;
      report.securityScore -= 1;
    }
  }

  const tree =
    typeof projectPathOrTree === "string"
      ? buildFileTree(projectPathOrTree).files
      : projectPathOrTree.files || projectPathOrTree;

  for (const file of tree) {
    if (!file.content) continue; // binary, too large, or unreadable — skip
    const content = file.content;

    if (/sk-[a-zA-Z0-9]{16,}/.test(content)) {
      addIssue("critical", file.relativePath, "API Key Exposed");
    }

    if (/(jwt_secret|jwtsecret)\s*[:=]\s*["'`].+["'`]/gi.test(content)) {
      addIssue("high", file.relativePath, "Hardcoded JWT Secret");
    }

    if (/mongodb(\+srv)?:\/\//gi.test(content)) {
      addIssue("high", file.relativePath, "Database URI Exposed");
    }

    if (/(password|passwd|pwd)\s*[:=]\s*["'`][^"'`]{4,}["'`]/gi.test(content)) {
      addIssue("high", file.relativePath, "Hardcoded Password");
    }

    if (content.includes("eval(")) {
      addIssue("critical", file.relativePath, "eval() Usage");
    }

    if (content.includes("exec(")) {
      addIssue("critical", file.relativePath, "Command Injection Risk");
    }

    if (content.includes(".innerHTML")) {
      addIssue("medium", file.relativePath, "Possible XSS Risk");
    }
  }

  if (report.securityScore >= 90) report.grade = "A";
  else if (report.securityScore >= 75) report.grade = "B";
  else if (report.securityScore >= 60) report.grade = "C";
  else report.grade = "D";

  report.securityScore = Math.max(report.securityScore, 0);

  if (report.critical > 0) report.recommendations.push("Remove exposed secrets immediately");
  if (report.high > 0) report.recommendations.push("Move secrets to .env");
  if (report.medium > 0) report.recommendations.push("Sanitize user input");

  return report;
}

module.exports = securityScanner;
