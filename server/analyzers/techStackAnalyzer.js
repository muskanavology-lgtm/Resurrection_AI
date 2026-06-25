const fs = require("fs");
const path = require("path");

function techStackAnalyzer(projectPath) {
  const result = {
    frontend: [],
    backend: [],
    database: [],
    mobile: [],
    devops: [],
    languages: []
  };

  let hasPhp = false;

  function scan(dir) {
    let files;
    try { files = fs.readdirSync(dir); } catch(e) { return; }

    for (const file of files) {
      const fullPath = path.join(dir, file);
      let stat;
      try { stat = fs.statSync(fullPath); } catch(e) { continue; }

      if (stat.isDirectory()) {
        if (file === "node_modules" || file === ".git" || file === "vendor" || file === "assets") {
          continue;
        }
        scan(fullPath);
      } else {
        if (file.endsWith(".php")) {
          result.languages.push("PHP");
          hasPhp = true;
        }
        if (file.endsWith(".js") || file.endsWith(".jsx")) result.languages.push("JavaScript");
        if (file.endsWith(".ts") || file.endsWith(".tsx")) result.languages.push("TypeScript");
        if (file.endsWith(".py")) result.languages.push("Python");
        if (file.endsWith(".java")) result.languages.push("Java");
      }
    }
  }

  scan(projectPath);

  if (hasPhp) {
    result.backend.push("PHP Native Engine");
    // Default Core PHP projects mostly use MySQL/MariaDB
    result.database.push("MySQL / PDO");
  }

  const packagePath = path.join(projectPath, "package.json");
  if (fs.existsSync(packagePath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };

      if (deps.react) result.frontend.push("React");
      if (deps.next) result.frontend.push("Next.js");
      if (!hasPhp && deps.express) result.backend.push("Express");
      if (deps.mongodb || deps.mongoose) result.database.push("MongoDB");
      if (deps.mysql) result.database.push("MySQL");
    } catch(e){}
  }

  result.languages = [...new Set(result.languages)];
  result.backend = [...new Set(result.backend)];
  result.database = [...new Set(result.database)];

  return result;
}

module.exports = techStackAnalyzer;