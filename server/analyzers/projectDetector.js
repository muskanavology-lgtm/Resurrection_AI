const fs = require("fs");
const path = require("path");

async function detectProject(projectPath) {
  const result = {
    framework: "Unknown",
    frontend: [],
    backend: [],
    database: [],
    languages: []
  };

  let phpCount = 0;
  let jsCount = 0;
  let hasMySQLKeywords = false; // PHP ke andar MySQL connection dhoodne ke liye

  function scan(dir) {
    let files;
    try {
      files = fs.readdirSync(dir);
    } catch (e) {
      return;
    }

    for (const file of files) {
      const fullPath = path.join(dir, file);
      let stat;
      try {
        stat = fs.statSync(fullPath);
      } catch (e) {
        continue;
      }

      if (stat.isDirectory()) {
        if (
          file === "node_modules" || 
          file === ".git" || 
          file === "vendor" || 
          file === "assets" ||
          file === "bower_components"
        ) {
          continue;
        }
        scan(fullPath);
      } else {
        // 1. Language Detection & Counting
        if (file.endsWith(".php")) {
          result.languages.push("PHP");
          phpCount++;

          // PHP file ki andar ki coding check karo database connection ke liye
          try {
            const content = fs.readFileSync(fullPath, "utf8");
            if (
              content.includes("mysqli_connect") || 
              content.includes("new mysqli") || 
              content.includes("mysql:host") || 
              content.includes("pdo")
            ) {
              hasMySQLKeywords = true;
            }
          } catch (err) {}
        }
        else if (file.endsWith(".js") || file.endsWith(".jsx")) {
          result.languages.push("JavaScript");
          jsCount++;
        }
        else if (file.endsWith(".ts") || file.endsWith(".tsx")) result.languages.push("TypeScript");
        else if (file.endsWith(".py")) result.languages.push("Python");
        else if (file.endsWith(".java")) result.languages.push("Java");

        // 2. Framework Specific Root Files Check
        if (file === "artisan") {
          result.framework = "Laravel";
          if (!result.backend.includes("PHP")) result.backend.push("PHP");
        }
        if (file === "manage.py") {
          result.framework = "Django";
          if (!result.backend.includes("Python")) result.backend.push("Python");
        }
        if (file === "pom.xml" || file === "build.gradle") {
          result.framework = "Spring Boot";
          if (!result.backend.includes("Java")) result.backend.push("Java");
        }

        // 3. package.json Check (Agar Node/JS project ho toh)
        if (file === "package.json") {
          try {
            const pkg = JSON.parse(fs.readFileSync(fullPath, "utf8"));
            const deps = { ...pkg.dependencies, ...pkg.devDependencies };

            if (deps.react) result.frontend.push("React");
            if (deps.next) result.frontend.push("Next.js");
            if (deps.vue) result.frontend.push("Vue");
            if (deps.express) result.backend.push("Express");
            if (deps.mongodb || deps.mongoose) result.database.push("MongoDB");
            if (deps.mysql || deps.mysql2) result.database.push("MySQL");
          } catch (e) {}
        }
      }
    }
  }

  scan(projectPath);

  // Clean arrays from duplicates
  result.languages = [...new Set(result.languages)];
  result.frontend = [...new Set(result.frontend)];
  result.backend = [...new Set(result.backend)];
  result.database = [...new Set(result.database)];

  // 4. Overwrite Rules (Smart Logic for Core PHP & Databases)
  if (phpCount > 0 && result.framework === "Unknown") {
    result.framework = "Core PHP Stack";
    if (!result.backend.includes("PHP")) result.backend.push("PHP");
    
    // Core PHP hai toh standard MySQL default set karo ya keyword milne par pakka karo
    if (hasMySQLKeywords || result.database.length === 0) {
      result.database.push("MySQL");
    }

    // Express ko hatao agar galti se assets files ki wajah se frontend logic crash hua ho
    result.backend = result.backend.filter(b => b !== "Express");
  } 
  else if (result.framework === "Unknown") {
    if (result.frontend.includes("React") && result.backend.includes("Express") && result.database.includes("MongoDB")) {
      result.framework = "MERN";
    } else if (jsCount > 0) {
      result.framework = "NodeJS / Vanilla JS";
    }
  }

  return result;
}

module.exports = detectProject;