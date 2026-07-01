const fs = require("fs");
const path = require("path");
const { buildFileTree } = require("../utils/fileTreeCache");

/*
  FIX (performance): shared tree use karta hai, dobara disk scan nahi karta.

  FIX (accuracy): pehle ye sirf package.json (Node ecosystem) aur 4 backend
  marker files (artisan, manage.py, pom.xml, .csproj) check karta tha. Isliye
  WordPress, Shopify, plain PHP, aur generic Laravel projects sab "Unknown"
  aate the kyunki unke liye koi detection rule hi nahi tha.

  Naye signals add kiye:
  - WordPress: wp-config.php, wp-content/ folder, wp-includes/ folder
  - Shopify: shopify.theme.toml, .theme-check.yml, sections/ + snippets/ +
    templates/ folder combo (Shopify Liquid theme structure), or
    "shopify-cli" / "@shopify/cli" in package.json
  - Laravel: artisan file (already had this) + composer.json with
    "laravel/framework"
  - Plain PHP (no framework): .php files present but no framework markers
  - Static HTML site: only .html/.css/.js, no backend markers at all
*/

async function detectProject(projectPathOrTree) {
  const result = {
    framework: "Unknown",
    frontend: [],
    backend: [],
    database: [],
    languages: [],
  };

  const isPathString = typeof projectPathOrTree === "string";
  const tree = isPathString ? buildFileTree(projectPathOrTree).files : projectPathOrTree.files || projectPathOrTree;
  // projectDetector needs the root path for fs.existsSync checks below even
  // when a pre-built tree is passed in (uploadController passes both).
  const projectPath = isPathString ? projectPathOrTree : projectPathOrTree.projectPath;

  const fileNames = new Set(tree.map((f) => f.name));
  const relPaths = tree.map((f) => f.relativePath.toLowerCase());

  for (const file of tree) {
    if (file.ext === ".js") result.languages.push("JavaScript");
    if (file.ext === ".ts") result.languages.push("TypeScript");
    if (file.ext === ".php") result.languages.push("PHP");
    if (file.ext === ".py") result.languages.push("Python");
    if (file.ext === ".java") result.languages.push("Java");
    if (file.ext === ".cs") result.languages.push("C#");

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
        if (deps.fastify) result.backend.push("Fastify");

        if (deps.mongodb || deps.mongoose) result.database.push("MongoDB");
        if (deps.mysql || deps.mysql2) result.database.push("MySQL");
        if (deps.pg) result.database.push("PostgreSQL");

        if (deps["@shopify/cli"] || deps["shopify-cli"]) {
          result.framework = "Shopify (CLI/App)";
          result.backend.push("Shopify");
        }
      } catch {
        // malformed package.json — skip
      }
    }

    if (file.name === "composer.json" && file.content) {
      try {
        const composer = JSON.parse(file.content);
        const deps = { ...composer.require, ...composer["require-dev"] };
        if (Object.keys(deps).some((d) => d.startsWith("laravel/"))) {
          result.framework = "Laravel";
          result.backend.push("PHP", "Laravel");
        }
        if (Object.keys(deps).some((d) => d.startsWith("symfony/"))) {
          result.backend.push("Symfony");
        }
        if (Object.keys(deps).some((d) => d.startsWith("wordpress/") || d.includes("wp-"))) {
          result.backend.push("WordPress");
        }
      } catch {
        // malformed composer.json
      }
    }

    if (file.name === "artisan") {
      result.framework = "Laravel";
      result.backend.push("PHP", "Laravel");
    }

    if (file.name === "wp-config.php" || file.name === "wp-load.php") {
      result.framework = "WordPress";
      result.backend.push("PHP", "WordPress");
      result.database.push("MySQL");
    }

    if (file.name === "manage.py") {
      result.framework = "Django";
      result.backend.push("Python", "Django");
    }

    if (file.name === "pom.xml" || file.name === "build.gradle") {
      result.framework = "Spring Boot";
      result.backend.push("Java", "Spring Boot");
    }

    if (file.ext === ".csproj") {
      result.framework = "ASP.NET";
      result.backend.push("C#", "ASP.NET");
    }

    if (file.name === "shopify.theme.toml" || file.name === ".theme-check.yml") {
      result.framework = "Shopify Theme (Liquid)";
      result.frontend.push("Shopify Liquid");
    }

    if (file.ext === ".liquid") {
      result.languages.push("Liquid");
      if (result.framework === "Unknown") result.framework = "Shopify Theme (Liquid)";
    }
  }

  // Folder-based signals (cheap — derived from relativePath, no extra disk hits)
  const hasFolder = (name) => relPaths.some((p) => p.split("/").includes(name) || p.split("\\").includes(name));

  if (hasFolder("wp-content") && hasFolder("wp-admin")) {
    result.framework = "WordPress";
    result.backend.push("PHP", "WordPress");
    result.database.push("MySQL");
  }

  if (hasFolder("sections") && hasFolder("snippets") && hasFolder("templates") && result.framework === "Unknown") {
    result.framework = "Shopify Theme (Liquid)";
    result.frontend.push("Shopify Liquid");
  }

  result.languages = [...new Set(result.languages)];
  result.frontend = [...new Set(result.frontend)];
  result.backend = [...new Set(result.backend)];
  result.database = [...new Set(result.database)];

  // MERN/MEAN/MEVN stack naming (only if nothing more specific was found)
  if (
    result.framework === "Unknown" &&
    result.frontend.includes("React") &&
    result.backend.includes("Express") &&
    result.database.includes("MongoDB")
  ) {
    result.framework = "MERN";
  }
  if (
    result.framework === "Unknown" &&
    result.frontend.includes("Angular") &&
    result.backend.includes("Express") &&
    result.database.includes("MongoDB")
  ) {
    result.framework = "MEAN";
  }
  if (
    result.framework === "Unknown" &&
    result.frontend.includes("Vue") &&
    result.backend.includes("Express") &&
    result.database.includes("MongoDB")
  ) {
    result.framework = "MEVN";
  }

  // Fallback signals so plain/unframeworked projects don't just say "Unknown"
  if (result.framework === "Unknown") {
    const hasPhp = result.languages.includes("PHP");
    const hasOnlyWeb = tree.every((f) => [".html", ".htm", ".css", ".js", ".json", ".md", ".png", ".jpg", ".svg", ".ico"].includes(f.ext) || !f.ext);
    if (hasPhp) {
      result.framework = "PHP (no framework detected)";
      if (!result.backend.includes("PHP")) result.backend.push("PHP");
    } else if (hasOnlyWeb && tree.some((f) => f.ext === ".html")) {
      result.framework = "Static HTML/CSS/JS Site";
    }
  }

  return result;
}

module.exports = detectProject;
