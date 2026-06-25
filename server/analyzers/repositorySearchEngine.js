const fs = require("fs");
const path = require("path");

function repositorySearchEngine(
  projectPath,
  keyword
) {

  const results = [];

  function walk(dir) {

    const files =
      fs.readdirSync(dir);

    for (const file of files) {

      const fullPath =
        path.join(dir, file);

      const stat =
        fs.statSync(fullPath);

      if (stat.isDirectory()) {

        walk(fullPath);

      } else {

        try {

          const content =
            fs.readFileSync(
              fullPath,
              "utf8"
            );

          const lines =
            content.split("\n");

          lines.forEach(
            (line, index) => {

              if (
                line
                  .toLowerCase()
                  .includes(
                    keyword.toLowerCase()
                  )
              ) {

                results.push({

                  file:
                    fullPath,

                  line:
                    index + 1,

                  code:
                    line.trim()

                });

              }

            }
          );

        } catch (err) {}

      }

    }

  }

  walk(projectPath);

  return results;

}

module.exports =
repositorySearchEngine;