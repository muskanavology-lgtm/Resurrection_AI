
const fs = require("fs");
const path = require("path");

function scanDependencies(projectPath) {

  const graph = {};

  function walk(dir) {

    const files = fs.readdirSync(dir);

    for (const file of files) {

      const fullPath = path.join(dir, file);

      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        walk(fullPath);
      } else {

        if (
          file.endsWith(".js") ||
          file.endsWith(".jsx") ||
          file.endsWith(".ts") ||
          file.endsWith(".tsx") ||
          file.endsWith(".php")
        ) {

          try {

            const content =
              fs.readFileSync(
                fullPath,
                "utf8"
              );

            const imports = [];

            const requireRegex =
              /require\(['"`](.*?)['"`]\)/g;

            const importRegex =
              /from\s+['"`](.*?)['"`]/g;

            let match;

            while (
              (match =
                requireRegex.exec(content))
            ) {
              imports.push(match[1]);
            }

            while (
              (match =
                importRegex.exec(content))
            ) {
              imports.push(match[1]);
            }

            graph[fullPath] = imports;

          } catch (err) {
            console.log(err.message);
          }

        }

      }

    }

  }

  walk(projectPath);

  return graph;
}

module.exports = scanDependencies;