const { buildFileTree } = require("../utils/fileTreeCache");

function flowAnalyzer(projectPathOrTree) {
  const flow = {
    frontend: [],
    routes: [],
    controllers: [],
    services: [],
    models: [],
    database: [],
  };

  const tree =
    typeof projectPathOrTree === "string"
      ? buildFileTree(projectPathOrTree).files
      : projectPathOrTree.files || projectPathOrTree;

  for (const file of tree) {
    const lower = file.relativePath.toLowerCase();

    if (lower.includes("component") || lower.includes("page")) flow.frontend.push(file.name);
    if (lower.includes("route")) flow.routes.push(file.name);
    if (lower.includes("controller")) flow.controllers.push(file.name);
    if (lower.includes("service")) flow.services.push(file.name);
    if (lower.includes("model")) flow.models.push(file.name);
    if (lower.includes("schema")) flow.database.push(file.name);
  }

  return flow;
}

module.exports = flowAnalyzer;
