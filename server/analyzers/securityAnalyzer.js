const fs = require("fs");
const path = require("path");

function securityAnalyzer(projectPath) {

  const report = {

    critical: 0,
    high: 0,
    medium: 0,

    issues: []
  };

  function addIssue(
    severity,
    file,
    message
  ) {

    report.issues.push({
      severity,
      file,
      message
    });

    if (severity === "critical")
      report.critical++;

    else if (severity === "high")
      report.high++;

    else
      report.medium++;

  }

  function scan(dir) {

    const files =
      fs.readdirSync(dir);

    for (const file of files) {

      const fullPath =
        path.join(dir, file);

      const stat =
        fs.statSync(fullPath);

      if (stat.isDirectory()) {

        if (
          file === "node_modules" ||
          file === ".git"
        ) continue;

        scan(fullPath);

      } else {

        try {

          const content =
            fs.readFileSync(
              fullPath,
              "utf8"
            );

          // OpenAI Key

          if (
            /sk-[a-zA-Z0-9]{20,}/.test(
              content
            )
          ) {

            addIssue(
              "critical",
              file,
              "Possible API Key exposed"
            );

          }

          // JWT Secret

          if (
            content.includes(
              "jwt.sign("
            ) &&
            content.includes('"')
          ) {

            addIssue(
              "high",
              file,
              "Possible hardcoded JWT secret"
            );

          }

          // Mongo URI

          if (
            content.includes(
              "mongodb+srv://"
            )
          ) {

            addIssue(
              "critical",
              file,
              "MongoDB URI exposed"
            );

          }

          // Password

          if (
            content.includes(
              "password"
            ) &&
            content.includes("=")
          ) {

            addIssue(
              "high",
              file,
              "Possible hardcoded password"
            );

          }

          // eval

          if (
            content.includes(
              "eval("
            )
          ) {

            addIssue(
              "critical",
              file,
              "Dangerous eval()"
            );

          }

          // exec

          if (
            content.includes(
              "exec("
            )
          ) {

            addIssue(
              "high",
              file,
              "Dangerous exec()"
            );

          }

          // innerHTML

          if (
            content.includes(
              ".innerHTML"
            )
          ) {

            addIssue(
              "medium",
              file,
              "Possible XSS"
            );

          }

        } catch (err) {}

      }

    }

  }

  scan(projectPath);

  return report;
}

module.exports =
securityAnalyzer;