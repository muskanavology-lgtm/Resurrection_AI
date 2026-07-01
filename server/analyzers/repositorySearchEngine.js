const fs = require("fs");
const path = require("path");

/*
  NOTE: ye function upload ke time NAHI chalta — sirf jab user
  "Repository Search" page se kuch search karta hai (on-demand,
  POST /api/repository-search). Isliye ise shared tree cache use karne ki
  zaroorat nahi (wo sirf upload-time pipeline ke liye hai), par node_modules
  jaisi heavy directories ko skip karna yahan bhi zaroori hai — warna search
  bahut slow aur irrelevant results se bhar jaata hai.
*/
const SKIP_DIRS = new Set(["node_modules", ".git", ".next", "dist", "build", "vendor", ".cache", "coverage"]);

function repositorySearchEngine(projectPath, keyword) {
  const results = [];
  const lowerKeyword = keyword.toLowerCase();

  function walk(dir) {
    if (results.length >= 200) return; // safety cap so one broad keyword can't hang the request

    let files;
    try {
      files = fs.readdirSync(dir);
    } catch {
      return;
    }

    for (const file of files) {
      if (results.length >= 200) return;
      if (SKIP_DIRS.has(file)) continue;

      const fullPath = path.join(dir, file);
      let stat;
      try {
        stat = fs.statSync(fullPath);
      } catch {
        continue;
      }

      if (stat.isDirectory()) {
        walk(fullPath);
      } else {
        try {
          const content = fs.readFileSync(fullPath, "utf8");
          const lines = content.split("\n");

          lines.forEach((line, index) => {
            if (results.length >= 200) return;
            if (line.toLowerCase().includes(lowerKeyword)) {
              results.push({
                file: fullPath,
                line: index + 1,
                code: line.trim(),
              });
            }
          });
        } catch {
          // binary or unreadable file — skip
        }
      }
    }
  }

  walk(projectPath);

  return results;
}

module.exports = repositorySearchEngine;
