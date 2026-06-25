const fs = require("fs");
const path = require("path");

function databaseAnalyzer(projectPath) {

  const result = {
    collections: [],
    tables: []
  };

  function scan(dir) {

    const files = fs.readdirSync(dir);

    for (const file of files) {

      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        scan(fullPath);
      } else {

        try {

          const content = fs.readFileSync(
            fullPath,
            "utf8"
          );

          // MongoDB Models
          const mongoRegex =
            /mongoose\.model\s*\(\s*["'`](.*?)["'`]/g;

          let match;

          while (
            (match = mongoRegex.exec(content))
          ) {
            result.collections.push(match[1]);
          }

          // SQL Tables
          const sqlRegex =
            /CREATE\s+TABLE\s+([a-zA-Z0-9_]+)/gi;

          while (
            (match = sqlRegex.exec(content))
          ) {
            result.tables.push(match[1]);
          }

        } catch (err) {}

      }
    }
  }

  scan(projectPath);

  return result;
}

module.exports = databaseAnalyzer;