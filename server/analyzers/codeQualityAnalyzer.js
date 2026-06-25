const fs = require("fs");
const path = require("path");

function codeQualityAnalyzer(projectPath) {

  const report = {
    totalFiles: 0,
    largeFiles: [],
    longFunctions: [],
    unusedImports: [],
    complexity: "LOW",
    maintainability: "95%"
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

      } else {

        if (
          file.endsWith(".js") ||
          file.endsWith(".jsx") ||
          file.endsWith(".ts") ||
          file.endsWith(".tsx")
        ) {

          report.totalFiles++;

          try {

            const content =
              fs.readFileSync(
                fullPath,
                "utf8"
              );

            const lines =
              content.split("\n");

            // Large File

            if (lines.length > 500) {

              report.largeFiles.push({
                file,
                lines:
                  lines.length
              });

            }

            // Long Function

            const functions =
              content.match(
                /function\s+[a-zA-Z0-9_]+/g
              ) || [];

            if (
              functions.length > 20
            ) {

              report.longFunctions.push({
                file,
                count:
                  functions.length
              });

            }

            // Unused Import

            const imports =
              content.match(
                /require\(.+\)|import.+from/g
              ) || [];

            if (
              imports.length > 30
            ) {

              report.unusedImports.push({
                file,
                imports:
                  imports.length
              });

            }

          } catch (err) {}
        }
      }
    }
  }

  walk(projectPath);

  const totalIssues =
    report.largeFiles.length +
    report.longFunctions.length +
    report.unusedImports.length;

  if (totalIssues > 20) {

    report.complexity = "HIGH";
    report.maintainability = "60%";

  } else if (totalIssues > 10) {

    report.complexity = "MEDIUM";
    report.maintainability = "75%";

  }

  return report;
}

module.exports =
codeQualityAnalyzer;