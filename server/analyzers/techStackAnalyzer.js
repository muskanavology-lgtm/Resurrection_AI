const { buildFileTree } = require("../utils/fileTreeCache");

function techStackAnalyzer(projectPathOrTree) {
  const result = {
    frontend: [],
    backend: [],
    database: [],
    mobile: [],
    devops: [],
    languages: [],
  };

  const tree =
    typeof projectPathOrTree === "string"
      ? buildFileTree(projectPathOrTree).files
      : projectPathOrTree.files || projectPathOrTree;

  for (const file of tree) {
    if (file.ext === ".js") result.languages.push("JavaScript");
    if (file.ext === ".ts") result.languages.push("TypeScript");
    if (file.ext === ".php") result.languages.push("PHP");
    if (file.ext === ".py") result.languages.push("Python");
    if (file.ext === ".java") result.languages.push("Java");
    if (file.ext === ".cs") result.languages.push("C#");
    if (file.ext === ".go") result.languages.push("Go");
    if (file.ext === ".dart") result.languages.push("Dart");
    if (file.ext === ".liquid") result.languages.push("Liquid");

    if (file.name === "package.json" && file.content) {
      try {
        const pkg = JSON.parse(file.content);
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };

        if (deps.react) result.frontend.push("React");
        if (deps.next) result.frontend.push("Next.js");
        if (deps.vue) result.frontend.push("Vue");
        if (deps.angular || deps["@angular/core"]) result.frontend.push("Angular");

        if (deps.express) result.backend.push("Express");
        if (deps.nestjs || deps["@nestjs/core"]) result.backend.push("NestJS");

        if (deps.mongodb || deps.mongoose) result.database.push("MongoDB");
        if (deps.mysql || deps.mysql2) result.database.push("MySQL");
        if (deps.pg) result.database.push("PostgreSQL");
        if (deps.sqlite3) result.database.push("SQLite");

        if (deps["react-native"]) result.mobile.push("React Native");
        if (deps.flutter) result.mobile.push("Flutter");
      } catch {
        // malformed package.json
      }
    }

    if (file.name === "composer.json" && file.content) {
      try {
        const composer = JSON.parse(file.content);
        const deps = { ...composer.require, ...composer["require-dev"] };
        if (Object.keys(deps).some((d) => d.startsWith("laravel/"))) {
          result.backend.push("Laravel");
          result.database.push("MySQL");
        }
      } catch {
        // malformed composer.json
      }
    }

    if (file.name === "wp-config.php") {
      result.backend.push("WordPress");
      result.database.push("MySQL");
    }

    if (file.name === "Dockerfile" || file.name === "docker-compose.yml") {
      result.devops.push("Docker");
    }
  }

  result.languages = [...new Set(result.languages)];
  result.frontend = [...new Set(result.frontend)];
  result.backend = [...new Set(result.backend)];
  result.database = [...new Set(result.database)];
  result.mobile = [...new Set(result.mobile)];
  result.devops = [...new Set(result.devops)];

  return result;
}

module.exports = techStackAnalyzer;
