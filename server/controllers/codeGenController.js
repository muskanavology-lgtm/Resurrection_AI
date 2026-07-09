const fs = require("fs");
const path = require("path");
const os = require("os");
const AdmZip = require("adm-zip");
const DocPlan = require("../models/DocPlan");
const askAI = require("../ai/askAI");

const MAX_FILES_TO_GENERATE = 12;

function buildCodeGenPrompt(plan, fileItem) {
  return `You are a senior developer. Generate COMPLETE, PRODUCTION-READY code for ONE file.

PROJECT: ${plan.suggestedFramework || "Unknown"} — ${plan.summary || ""}
ALL MODULES: ${(plan.modules || []).map((m) => m.name).join(", ")}

FILE TO GENERATE:
- Path: ${fileItem.filePath}
- Language: ${fileItem.language || "javascript"}
- Purpose: ${fileItem.explanation || ""}

Write COMPLETE working code. Include all imports. Add brief inline comments.
Return ONLY the raw code — no markdown fences, no preamble.`.trim();
}

function sanitizePath(filePath) {
  return path.normalize(filePath).replace(/^(\.\.[/\\])+/, "");
}

async function generateProjectFiles(req, res) {
  const { docPlanId } = req.params;
  try {
    const docPlan = await DocPlan.findById(docPlanId);
    if (!docPlan) {
      return res.status(404).json({ success: false, error: "Project plan not found." });
    }
    const plan = docPlan.generatedPlan;
    if (!plan || !plan.starterCode || plan.starterCode.length === 0) {
      return res.status(400).json({ success: false, error: "No starter files in plan. Re-upload documentation." });
    }
    const projectName = (plan.suggestedFramework || "project").toLowerCase().replace(/\s+/g, "-");
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), `resurrection-${projectName}-`));
    console.log(`[codeGen] Generating in ${tmpDir}`);

    const filesToGenerate = plan.starterCode.slice(0, MAX_FILES_TO_GENERATE);
    const generatedFiles = [];
    const errors = [];

    for (const fileItem of filesToGenerate) {
      try {
        let code = fileItem.code || "";
        const isStub = !code || code.trim().length < 50 || code.includes("// TODO");
        if (isStub) {
          console.log(`[codeGen] AI generating: ${fileItem.filePath}`);
          code = await askAI(buildCodeGenPrompt(plan, fileItem));
        }
        const safePath = sanitizePath(fileItem.filePath);
        const fullPath = path.join(tmpDir, safePath);
        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        fs.writeFileSync(fullPath, code, "utf8");
        generatedFiles.push({ filePath: safePath, size: code.length });
        console.log(`[codeGen] OK: ${safePath}`);
      } catch (fileErr) {
        console.error(`[codeGen] FAIL: ${fileItem.filePath}:`, fileErr.message);
        errors.push({ file: fileItem.filePath, error: fileErr.message });
      }
    }

    // Create placeholder files from suggestedFileStructure
    if (plan.suggestedFileStructure) {
      for (const line of plan.suggestedFileStructure.split("\n")) {
        const trimmed = line.trim();
        if (!/\.[a-zA-Z]{1,6}$/.test(trimmed) || !trimmed) continue;
        const cleanPath = trimmed.replace(/^[│├└─\s]+/, "");
        if (generatedFiles.some((f) => f.filePath.endsWith(cleanPath))) continue;
        try {
          const safePath = sanitizePath(cleanPath);
          const fullPath = path.join(tmpDir, safePath);
          fs.mkdirSync(path.dirname(fullPath), { recursive: true });
          if (!fs.existsSync(fullPath)) {
            fs.writeFileSync(fullPath, `// ${cleanPath}\n// TODO: Implement this file\n// Part of: ${plan.summary || projectName}\n`, "utf8");
          }
        } catch { /* non-fatal */ }
      }
    }

    // Add config files
    addProjectConfig(tmpDir, plan);

    // ZIP everything
    const zip = new AdmZip();
    zip.addLocalFolder(tmpDir, projectName);
    const zipBuffer = zip.toBuffer();
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch { /* non-fatal */ }

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${projectName}-generated.zip"`);
    res.setHeader("Content-Length", zipBuffer.length);
    console.log(`[codeGen] Done. ${generatedFiles.length} files, ${errors.length} errors.`);
    return res.end(zipBuffer);
  } catch (error) {
    console.error("CODE GEN ERROR:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

function addProjectConfig(tmpDir, plan) {
  const fw = (plan.suggestedFramework || "").toLowerCase();
  try {
    if (fw.includes("mern") || fw.includes("node") || fw.includes("express") || fw.includes("next")) {
      const pkgPath = path.join(tmpDir, "package.json");
      if (!fs.existsSync(pkgPath)) {
        const deps = { express: "^4.18.2", dotenv: "^16.3.1" };
        if (fw.includes("mongo") || fw.includes("mern")) deps.mongoose = "^8.0.0";
        if (fw.includes("next")) { deps.next = "^14.0.0"; deps.react = "^18.0.0"; deps["react-dom"] = "^18.0.0"; }
        fs.writeFileSync(pkgPath, JSON.stringify({
          name: plan.suggestedFramework?.toLowerCase().replace(/\s+/g, "-") || "generated-project",
          version: "1.0.0", description: plan.summary || "",
          scripts: { start: "node index.js", dev: "nodemon index.js" },
          dependencies: deps, devDependencies: { nodemon: "^3.0.0" }
        }, null, 2), "utf8");
      }
    } else if (fw.includes("laravel") || fw.includes("php")) {
      const composerPath = path.join(tmpDir, "composer.json");
      if (!fs.existsSync(composerPath)) {
        fs.writeFileSync(composerPath, JSON.stringify({ name: "generated/project", require: { php: "^8.1", "laravel/framework": "^10.0" } }, null, 2), "utf8");
      }
    } else if (fw.includes("django") || fw.includes("python")) {
      const reqPath = path.join(tmpDir, "requirements.txt");
      if (!fs.existsSync(reqPath)) fs.writeFileSync(reqPath, "Django>=4.2\ndjangorestframework>=3.14\npython-dotenv>=1.0\n", "utf8");
    }
    const envPath = path.join(tmpDir, ".env.example");
    if (!fs.existsSync(envPath)) fs.writeFileSync(envPath, "PORT=5000\nDB_URL=\nJWT_SECRET=your_secret_here\n", "utf8");
    const readmePath = path.join(tmpDir, "README.md");
    if (!fs.existsSync(readmePath)) {
      fs.writeFileSync(readmePath, [
        `# ${plan.suggestedFramework || "Generated"} Project`, "", plan.summary || "",
        "", "## Generated by Resurrection AI", "", "## Modules",
        ...(plan.modules || []).map((m) => `- **${m.name}**: ${m.description}`),
        "", "## Setup", "```bash", "npm install", "cp .env.example .env", "npm run dev", "```"
      ].join("\n"), "utf8");
    }
  } catch { /* non-fatal */ }
}

module.exports = { generateProjectFiles };
