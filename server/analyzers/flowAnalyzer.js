const fs = require("fs");
const path = require("path");

function flowAnalyzer(projectPath) {

  const flow = {
    frontend: [],
    routes: [],
    controllers: [],
    services: [],
    models: [],
    database: []
  };

  function walk(dir) {

    const files = fs.readdirSync(dir);

    for (const file of files) {

      const fullPath =
        path.join(dir, file);

      const stat =
        fs.statSync(fullPath);

      if (stat.isDirectory()) {
        walk(fullPath);
      }
      else {

        const lower =
          fullPath.toLowerCase();

        if (
          lower.includes("component") ||
          lower.includes("page")
        ) {
          flow.frontend.push(file);
        }

        if (
          lower.includes("route")
        ) {
          flow.routes.push(file);
        }

        if (
          lower.includes("controller")
        ) {
          flow.controllers.push(file);
        }

        if (
          lower.includes("service")
        ) {
          flow.services.push(file);
        }

        if (
          lower.includes("model")
        ) {
          flow.models.push(file);
        }

        if (
          lower.includes("schema")
        ) {
          flow.database.push(file);
        }
      }
    }
  }

  walk(projectPath);

  return flow;
}

module.exports =
flowAnalyzer;