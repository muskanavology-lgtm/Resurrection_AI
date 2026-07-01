const { buildFileTree } = require("../utils/fileTreeCache");
function productionReadinessAnalyzer(projectPathOrTree) {
  const report = {
    score: 100,
    productionReady: true,
    checks: {
      helmet: false,
      cors: false,
      logging: false,
      rateLimiting: false,
      envVariables: false,
    },
    missing: [],
  };
  const tree =
    typeof projectPathOrTree === "string"
      ? buildFileTree(projectPathOrTree).files
      : projectPathOrTree.files || projectPathOrTree;
  for (const file of tree) {
    if (!file.content) continue;
    const content = file.content;
    if (content.includes("helmet(")) report.checks.helmet = true;
    if (content.includes("cors(")) report.checks.cors = true;
    if (content.includes("morgan(")) report.checks.logging = true;
    if (content.includes("rateLimit(")) report.checks.rateLimiting = true;
    if (content.includes("process.env")) report.checks.envVariables = true;
  }
  if (!report.checks.helmet) {
    report.score -= 10;
    report.missing.push("Helmet Security");
  }
  if (!report.checks.logging) {
    report.score -= 10;
    report.missing.push("Morgan Logging");
  }
  if (!report.checks.rateLimiting) {
    report.score -= 15;
    report.missing.push("Rate Limiter");
  }
  if (!report.checks.envVariables) {
    report.score -= 20;
    report.missing.push("Environment Variables");
  }
  report.productionReady = report.score >= 70;
  return report;
}
module.exports = productionReadinessAnalyzer;
