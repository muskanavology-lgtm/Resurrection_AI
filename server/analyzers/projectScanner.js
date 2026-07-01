const { buildFileTree } = require("../utils/fileTreeCache");

const scanProject = (dirPathOrTree) => {
  const result = {
    totalFiles: 0,
    controllers: [],
    models: [],
    routes: [],
    components: [],
    pages: [],
    middleware: [],
  };

  const tree =
    typeof dirPathOrTree === "string"
      ? buildFileTree(dirPathOrTree).files
      : dirPathOrTree.files || dirPathOrTree;

  for (const file of tree) {
    result.totalFiles++;
    const lower = file.relativePath.toLowerCase();

    if (lower.includes("controller")) result.controllers.push(file.name);
    if (lower.includes("model")) result.models.push(file.name);
    if (lower.includes("route")) result.routes.push(file.name);
    if (lower.includes("component")) result.components.push(file.name);
    if (lower.includes("page")) result.pages.push(file.name);
    if (lower.includes("middleware")) result.middleware.push(file.name);
  }

  return result;
};

module.exports = scanProject;
