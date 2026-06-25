const fs = require("fs");
const path = require("path");

function universalTechDetector(projectPath) {

  const result = {

    frontend: [],
    backend: [],
    database: [],
    mobile: [],
    devops: [],
    languages: []

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

        const lower =
          file.toLowerCase();

        // Languages

        if (lower.endsWith(".php"))
          result.languages.push("PHP");

        if (lower.endsWith(".js"))
          result.languages.push("JavaScript");

        if (lower.endsWith(".ts"))
          result.languages.push("TypeScript");

        if (lower.endsWith(".py"))
          result.languages.push("Python");

        if (lower.endsWith(".java"))
          result.languages.push("Java");

        if (lower.endsWith(".cs"))
          result.languages.push("C#");

        if (lower.endsWith(".go"))
          result.languages.push("Go");

        if (lower.endsWith(".rs"))
          result.languages.push("Rust");

        if (lower.endsWith(".dart"))
          result.languages.push("Dart");

      }

    }

  }

  walk(projectPath);

  const unique =
    arr => [...new Set(arr)];

  result.languages =
    unique(result.languages);

  // Framework Detection

  const packageJson =
    path.join(
      projectPath,
      "package.json"
    );

  if (
    fs.existsSync(packageJson)
  ) {

    const pkg =
      JSON.parse(
        fs.readFileSync(
          packageJson,
          "utf8"
        )
      );

    const deps = {

      ...pkg.dependencies,

      ...pkg.devDependencies

    };

    if (deps.react)
      result.frontend.push(
        "React"
      );

    if (deps.next)
      result.frontend.push(
        "Next.js"
      );

    if (deps.vue)
      result.frontend.push(
        "Vue"
      );

    if (deps.angular)
      result.frontend.push(
        "Angular"
      );

    if (deps.express)
      result.backend.push(
        "Express"
      );

    if (deps.mongoose)
      result.database.push(
        "MongoDB"
      );

  }

  // Laravel

  if (
    fs.existsSync(
      path.join(
        projectPath,
        "artisan"
      )
    )
  ) {

    result.backend.push(
      "Laravel"
    );

  }

  // WordPress

  if (
    fs.existsSync(
      path.join(
        projectPath,
        "wp-config.php"
      )
    )
  ) {

    result.backend.push(
      "WordPress"
    );

  }

  // Django

  if (
    fs.existsSync(
      path.join(
        projectPath,
        "manage.py"
      )
    )
  ) {

    result.backend.push(
      "Django"
    );

  }

  // Flutter

  if (
    fs.existsSync(
      path.join(
        projectPath,
        "pubspec.yaml"
      )
    )
  ) {

    result.mobile.push(
      "Flutter"
    );

  }

  return result;

}

module.exports =
universalTechDetector;