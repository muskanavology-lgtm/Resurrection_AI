const fs = require("fs");
const path = require("path");

const routes = [];

function scanDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);

    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      scanDirectory(fullPath);
    } else {
      if (
        file.endsWith(".js") ||
        file.endsWith(".ts")
      ) {
        try {
          const content = fs.readFileSync(
            fullPath,
            "utf8"
          );

          const regex =
            /router\.(get|post|put|delete|patch)\s*\(\s*["'`](.*?)["'`]/g;

          let match;

          while ((match = regex.exec(content)) !== null) {
            routes.push({
              method: match[1].toUpperCase(),
              path: match[2],
              file
            });
          }
        } catch (err) {}
      }
    }
  }
}

function extractRoutes(projectPath) {
  routes.length = 0;

  scanDirectory(projectPath);

  return routes;
}

module.exports = extractRoutes;