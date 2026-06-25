const fs = require("fs");
const path = require("path");

function schemaVisualizer(projectPath) {

  const result = {

    collections: [],
    tables: [],
    relationships: []

  };

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

          // Mongoose Model

          const modelRegex =
            /mongoose\.model\s*\(\s*['"`](.*?)['"`]/g;

          let match;

          while (
            (match =
              modelRegex.exec(content))
          ) {

            result.collections.push(
              match[1]
            );

          }

          // SQL Tables

          const sqlRegex =
            /CREATE TABLE ([a-zA-Z0-9_]+)/gi;

          while (
            (match =
              sqlRegex.exec(content))
          ) {

            result.tables.push(
              match[1]
            );

          }

          // References

          const refRegex =
            /ref\s*:\s*['"`](.*?)['"`]/g;

          while (
            (match =
              refRegex.exec(content))
          ) {

            result.relationships.push({

              from:
                file,

              to:
                match[1],

              type:
                "belongsTo"

            });

          }

        }
        catch (err) {}

      }

    }

  }

  walk(projectPath);

  return result;
}

module.exports =
schemaVisualizer;