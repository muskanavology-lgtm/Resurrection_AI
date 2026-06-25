const fs = require("fs");
const path = require("path");

function executionFlowAnalyzer(projectPath) {

  const flow = [];

  function walk(dir) {

    const files = fs.readdirSync(dir);

    for (const file of files) {

      const fullPath =
        path.join(dir, file);

      const stat =
        fs.statSync(fullPath);

      if (stat.isDirectory()) {
        walk(fullPath);
        continue;
      }

      const lower =
        file.toLowerCase();

      try {

        const content =
          fs.readFileSync(
            fullPath,
            "utf8"
          );

        // Express Routes

        if (
          content.includes("router.") ||
          content.includes("express.Router")
        ) {

          flow.push({
            type: "Route",
            file
          });

        }

        // Controllers

        if (
          lower.includes("controller")
        ) {

          flow.push({
            type: "Controller",
            file
          });

        }

        // Services

        if (
          lower.includes("service")
        ) {

          flow.push({
            type: "Service",
            file
          });

        }

        // Models

        if (
          lower.includes("model")
        ) {

          flow.push({
            type: "Model",
            file
          });

        }

        // React

        if (
          file.endsWith(".jsx") ||
          file.endsWith(".tsx")
        ) {

          flow.push({
            type:
              "React Component",
            file
          });

        }

        // HTML

        if (
          file.endsWith(".html")
        ) {

          flow.push({
            type:
              "Frontend Page",
            file
          });

        }

        // PHP

        if (
          file.endsWith(".php")
        ) {

          flow.push({
            type:
              "PHP Module",
            file
          });

        }

        // Python

        if (
          file.endsWith(".py")
        ) {

          flow.push({
            type:
              "Python Module",
            file
          });

        }

        // Java

        if (
          file.endsWith(".java")
        ) {

          flow.push({
            type:
              "Java Class",
            file
          });

        }

      }
      catch (err) {}

    }

  }

  walk(projectPath);

  return flow;

}

module.exports =
executionFlowAnalyzer;