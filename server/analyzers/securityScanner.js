const fs = require("fs");
const path = require("path");

function securityScanner(projectPath) {

  const report = {

    securityScore: 100,

    grade: "A",

    critical: 0,
    high: 0,
    medium: 0,
    low: 0,

    issues: [],

    recommendations: []
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

    if (severity === "critical") {
      report.critical++;
      report.securityScore -= 15;
    }

    if (severity === "high") {
      report.high++;
      report.securityScore -= 8;
    }

    if (severity === "medium") {
      report.medium++;
      report.securityScore -= 4;
    }

    if (severity === "low") {
      report.low++;
      report.securityScore -= 1;
    }

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

        scan(fullPath);

      } else {

        try {

          const content =
            fs.readFileSync(
              fullPath,
              "utf8"
            );

          // OpenAI/OpenRouter

          if (
            /sk-[a-zA-Z0-9]/g.test(
              content
            )
          ) {

            addIssue(
              "critical",
              file,
              "API Key Exposed"
            );

          }

          // JWT Secret

          if (
           /(jwt_secret|jwtsecret)\s*[:=]\s*["'`].+["'`]/gi.test(
              content
            )
          ) {

            addIssue(
              "high",
              file,
              "Hardcoded JWT Secret"
            );

          }

          // Mongo URI

          if (
            /mongodb(\+srv)?:\/\//gi.test(
              content
            )
          ) {

            addIssue(
              "high",
              file,
              "Database URI Exposed"
            );

          }

          // Password

          if (
           /(password|passwd|pwd)\s*[:=]\s*["'`][^"'`]{4,}["'`]/gi
              .test(content)
          ) {

            addIssue(
              "high",
              file,
              "Hardcoded Password"
            );

          }

          // eval()

          if (
            content.includes("eval(")
          ) {

            addIssue(
              "critical",
              file,
              "eval() Usage"
            );

          }

          // exec()

          if (
            content.includes("exec(")
          ) {

            addIssue(
              "critical",
              file,
              "Command Injection Risk"
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
              "Possible XSS Risk"
            );

          }

        }
        catch (err) {}
      }
    }
  }

  scan(projectPath);

  // Grade

  if (
    report.securityScore >= 90
  ) {
    report.grade = "A";
  }
  else if (
    report.securityScore >= 75
  ) {
    report.grade = "B";
  }
  else if (
    report.securityScore >= 60
  ) {
    report.grade = "C";
  }
  else {
    report.grade = "D";
  }

  report.securityScore =
    Math.max(
      report.securityScore,
      0
    );

  // Recommendations

  if (report.critical > 0) {

    report.recommendations.push(
      "Remove exposed secrets immediately"
    );

  }

  if (report.high > 0) {

    report.recommendations.push(
      "Move secrets to .env"
    );

  }

  if (report.medium > 0) {

    report.recommendations.push(
      "Sanitize user input"
    );

  }

  return report;
}

module.exports =
securityScanner;