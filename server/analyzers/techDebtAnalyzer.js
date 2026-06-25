const fs = require("fs");
const path = require("path");

function techDebtAnalyzer(projectPath) {

  const report = {

    maintainabilityScore: 100,

    technicalDebt: "Low",

    duplicateFiles: 0,

    largeFiles: 0,

    deadFiles: 0,

    unusedImports: 0,

    estimatedRefactorTime: "0 Hours"
  };

  const fileHashes = {};

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

          // Large Files

          const lines =
            content.split("\n").length;

          if (lines > 500) {

            report.largeFiles++;

            report.maintainabilityScore -= 2;
          }

          // Duplicate Files

          const hash =
            content.length;

          if (fileHashes[hash]) {

            report.duplicateFiles++;

            report.maintainabilityScore -= 3;

          } else {

            fileHashes[hash] = true;
          }

          // Unused Imports

          const imports =
            content.match(
              /import .* from/g
            ) || [];

          if (
            imports.length > 20
          ) {

            report.unusedImports++;

            report.maintainabilityScore -= 1;
          }

        }
        catch (err) {}
      }
    }
  }

  walk(projectPath);

  if (
    report.maintainabilityScore < 70
  ) {

    report.technicalDebt =
      "High";

  }
  else if (
    report.maintainabilityScore < 85
  ) {

    report.technicalDebt =
      "Medium";

  }

  report.estimatedRefactorTime =
    `${Math.ceil(
      (100 -
        report.maintainabilityScore) /
      5
    )} Hours`;

  return report;
}

module.exports =
techDebtAnalyzer;