const fs = require("fs");
const path = require("path");

const scanProject = (dirPath) => {
  const result = {
    totalFiles: 0,
    controllers: [],
    models: [],
    routes: [],
    components: [],
    pages: [],
    middleware: []
  };

  function walk(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const fullPath = path.join(dir, file);

      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        walk(fullPath);
      } else {
        result.totalFiles++;

        const lower = fullPath.toLowerCase();

        if (lower.includes("controller"))
          result.controllers.push(file);

        if (lower.includes("model"))
          result.models.push(file);

        if (lower.includes("route"))
          result.routes.push(file);

        if (lower.includes("component"))
          result.components.push(file);

        if (lower.includes("page"))
          result.pages.push(file);

        if (lower.includes("middleware"))
          result.middleware.push(file);
      }
    }
  }

  walk(dirPath);

  return result;
};

module.exports = scanProject;