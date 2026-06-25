const generateSummary = (analysis, scanResult) => {
  let summary = "";
  summary += `Framework: ${analysis.framework}\n`;
  summary += `Frontend: ${analysis.frontend}\n`;
  summary += `Backend: ${analysis.backend}\n`;
  summary += `Database: ${analysis.database}\n\n`;

  summary += `Total Files: ${scanResult.totalFiles}\n`;
  summary += `Controllers: ${scanResult.controllers.length}\n`;
  summary += `Models: ${scanResult.models.length}\n`;
  summary += `Routes: ${scanResult.routes.length}\n`;
  summary += `Components: ${scanResult.components.length}\n`;
  summary += `Pages: ${scanResult.pages.length}\n`;
  summary += `Middleware: ${scanResult.middleware.length}\n`;
  return summary;
};
module.exports = generateSummary;