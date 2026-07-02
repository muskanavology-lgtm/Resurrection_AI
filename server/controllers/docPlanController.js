const extractDocumentText = require("../utils/documentExtractor");
const DocPlan = require("../models/DocPlan");
const OpenAI = require("openai");

function extractJSON(text) {
  if (!text) return null;
  try {
    const stripped = text.replace(/```json|```/gi, "").trim();
    return JSON.parse(stripped);
  } catch {}
  try {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(text.substring(start, end + 1));
    }
  } catch {}
  try {
    const match = text.match(/```json\s*([\s\S]*?)```/i);
    if (match) return JSON.parse(match[1].trim());
  } catch {}
  return null;
}

async function callAI(systemPrompt, userPrompt) {
  const client = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
  });
  const response = await client.chat.completions.create({
    model: "meta-llama/llama-3.1-70b-instruct",
    max_tokens: 6000,
    temperature: 0.1,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });
  return response.choices?.[0]?.message?.content || "";
}

// Phase 1: Get project plan (structure, modules, routes, schema)
const PLAN_PROMPT = (docText) => `
Analyze this project documentation and return ONLY a raw JSON object. No text before or after.

DOCUMENTATION:
---
${docText.substring(0, 16000)}
---

Return this exact JSON shape:
{
  "summary": "2-3 sentence project summary",
  "suggestedFramework": "MERN or Laravel or Django etc",
  "modules": [
    { "name": "Module Name", "description": "what it does", "priority": "High" }
  ],
  "frontendPages": ["Page1", "Page2"],
  "backendRoutes": [
    { "method": "POST", "path": "/api/auth/login", "purpose": "User login" }
  ],
  "databaseSchema": [
    { "table": "users", "fields": ["id", "name", "email", "password_hash", "created_at"] }
  ],
  "suggestedFileStructure": "project/\\n  src/\\n    controllers/\\n    models/\\n    routes/\\n  package.json",
  "filesToGenerate": [
    { "filePath": "src/controllers/authController.js", "language": "javascript", "purpose": "Authentication logic" },
    { "filePath": "src/models/User.js", "language": "javascript", "purpose": "User database model" },
    { "filePath": "src/routes/auth.js", "language": "javascript", "purpose": "Auth API routes" },
    { "filePath": "src/middleware/auth.js", "language": "javascript", "purpose": "JWT middleware" },
    { "filePath": "src/config/db.js", "language": "javascript", "purpose": "Database connection" },
    { "filePath": "index.js", "language": "javascript", "purpose": "Main server entry point" }
  ]
}

List ALL files that need to be created for a complete working project in filesToGenerate.
`.trim();

// Phase 2: Generate real code for each file
const CODE_PROMPT = (plan, fileItem) => `
You are a senior developer. Write COMPLETE, PRODUCTION-READY code for this file.

PROJECT: ${plan.suggestedFramework} — ${plan.summary}
ALL MODULES: ${plan.modules.map(m => m.name).join(", ")}
DATABASE TABLES: ${plan.databaseSchema.map(t => t.table).join(", ")}
ALL FILES IN PROJECT: ${plan.filesToGenerate.map(f => f.filePath).join(", ")}

FILE TO WRITE:
Path: ${fileItem.filePath}
Language: ${fileItem.language}
Purpose: ${fileItem.purpose}

Rules:
- Write COMPLETE working code, not stubs or TODOs
- Include all imports/requires
- Use proper error handling (try/catch)
- Add brief comments for key sections
- Follow ${plan.suggestedFramework} best practices
- Make it production-ready quality

Return ONLY the raw code. No markdown fences, no explanation text.
`.trim();

const generateProjectPlan = async (req, res) => {
  try {
    console.log("===== Documentation Plan Request =====", req.file?.originalname);

    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded." });
    }

    let docText;
    try {
      docText = await extractDocumentText(req.file.path);
    } catch (extractErr) {
      return res.status(400).json({ success: false, error: extractErr.message });
    }

    if (!docText || docText.trim().length < 50) {
      return res.status(400).json({ success: false, error: "Document too short to analyze." });
    }

    console.log(`[docPlan] Extracted ${docText.length} chars`);

    // Phase 1: Get project structure plan
    const planResponse = await callAI(
      "You are a JSON API. Output ONLY raw valid JSON. Never write text before or after JSON.",
      PLAN_PROMPT(docText)
    );

    console.log("[docPlan] Plan response preview:", planResponse.substring(0, 200));
    const parsed = extractJSON(planResponse);

    if (!parsed) {
      return res.status(500).json({ success: false, error: "AI could not parse documentation. Please try again." });
    }

    const plan = {
      summary: parsed.summary || "",
      suggestedFramework: parsed.suggestedFramework || "Unknown",
      modules: Array.isArray(parsed.modules) ? parsed.modules : [],
      frontendPages: Array.isArray(parsed.frontendPages) ? parsed.frontendPages : [],
      backendRoutes: Array.isArray(parsed.backendRoutes) ? parsed.backendRoutes : [],
      databaseSchema: Array.isArray(parsed.databaseSchema) ? parsed.databaseSchema : [],
      suggestedFileStructure: parsed.suggestedFileStructure || "",
      filesToGenerate: Array.isArray(parsed.filesToGenerate) ? parsed.filesToGenerate : [],
      starterCode: [], // will be filled in Phase 2
    };

    // Phase 2: Generate real code for each file (up to 10 files)
    const filesToCode = plan.filesToGenerate.slice(0, 10);
    console.log(`[docPlan] Generating code for ${filesToCode.length} files...`);

    const starterCode = [];
    for (const fileItem of filesToCode) {
      try {
        console.log(`[docPlan] Coding: ${fileItem.filePath}`);
        const code = await callAI(
          "You are a senior developer. Return ONLY raw source code. No markdown, no explanation.",
          CODE_PROMPT(plan, fileItem)
        );
        starterCode.push({
          filePath: fileItem.filePath,
          language: fileItem.language,
          purpose: fileItem.purpose,
          code: code.replace(/```[\w]*/g, "").replace(/```/g, "").trim(),
          explanation: fileItem.purpose,
        });
        console.log(`[docPlan] Done: ${fileItem.filePath} (${code.length} chars)`);
      } catch (codeErr) {
        console.error(`[docPlan] Failed: ${fileItem.filePath}:`, codeErr.message);
        starterCode.push({
          filePath: fileItem.filePath,
          language: fileItem.language,
          purpose: fileItem.purpose,
          code: `// ${fileItem.filePath}\n// TODO: Implement ${fileItem.purpose}\n`,
          explanation: fileItem.purpose,
        });
      }
    }

    plan.starterCode = starterCode;

    const savedPlan = await DocPlan.create({
      fileName: req.file.originalname,
      generatedPlan: plan,
      rawAIResponse: "",
    });

    console.log(`[docPlan] Complete. Plan saved: ${savedPlan._id}, ${starterCode.length} files coded`);

    return res.json({
      success: true,
      docPlanId: savedPlan._id,
      plan,
      rawAnswer: null,
    });
  } catch (error) {
    console.error("DOC PLAN ERROR:", error.message);
    console.error(error.stack);
    return res.status(500).json({ success: false, error: error.message });
  }
};

const getProjectPlan = async (req, res) => {
  try {
    const plan = await DocPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ success: false, error: "Plan not found." });
    res.json({ success: true, plan: plan.generatedPlan, docPlanId: plan._id });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { generateProjectPlan, getProjectPlan };
