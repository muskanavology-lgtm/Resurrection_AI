const fs = require("fs");
const path = require("path");

function autoFixEngine(projectPath) {

  const fixes = [];

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

          // Hardcoded JWT Secret

          if (
            content.includes(
              "jwt.sign("
            ) &&
            content.includes(
              "secret"
            )
          ) {

            fixes.push({

              file,

              severity:
                "HIGH",

              issue:
                "Hardcoded JWT Secret",

              fix:
                "Move secret to .env"

            });

          }

          // Missing Try Catch

          if (
            content.includes(
              "async"
            ) &&
            !content.includes(
              "catch"
            )
          ) {

            fixes.push({

              file,

              severity:
                "MEDIUM",

              issue:
                "Missing Error Handling",

              fix:
                "Add try/catch block"

            });

          }

          // Password

          if (
            content.includes(
              "password"
            ) &&
            !content.includes(
              "bcrypt"
            )
          ) {

            fixes.push({

              file,

              severity:
                "HIGH",

              issue:
                "Password may not be encrypted",

              fix:
                "Use bcrypt.hash()"

            });

          }

        }
        catch (err) {}

      }

    }

  }

  walk(projectPath);

  return fixes;
}

module.exports =
autoFixEngine;