const extractDocumentText = require("../utils/documentExtractor");
const DocPlan = require("../models/DocPlan");
const askAI = require("../ai/askAI");

/*
  NAYA FEATURE: Documentation-Only Project Planner

  Use case: developer ke paas abhi code nahi hai, sirf ek documentation
  file hai (requirements doc, spec, PRD, etc). Wo isko upload karta hai,
  aur AI:
    1. Document padhta hai
    2. Poora project plan banata hai — kaunse modules honge, kya frontend
       pages honge, kaunsi backend routes honge, database schema kaisa
       hoga
    3. Suggested file/folder structure deta hai
    4. KUCH starter files ka actual CODE bhi likh ke deta hai (jaise Claude
       karta hai) — explanation ke saath

  Response bahut bada ho sakta hai (LLM se), isliye JSON parsing fail hone
  par bhi raw text fallback ke roop mein save/return hota hai — user ko
  kabhi khaali response nahi milta.
*/

const PLAN_PROMPT_TEMPLATE = (docText) => `
You are a senior software architect. A developer has shared a project
requirements/documentation file (no code exists yet). Read it carefully and
produce a COMPLETE project plan.

--- DOCUMENT CONTENT ---
${docText.substring(0, 18000)}
--- END DOCUMENT ---

Return ONLY valid JSON (no markdown fences, no preamble) in EXACTLY this shape:

{
  "summary": "2-3 sentence summary of what this project is",
  "suggestedFramework": "e.g. MERN, Laravel, Django, etc - pick the best fit",
  "modules": [
    { "name": "Authentication", "description": "...", "priority": "High" }
  ],
  "frontendPages": ["Login Page", "Dashboard", "..."],
  "backendRoutes": [
    { "method": "POST", "path": "/api/auth/login", "purpose": "..." }
  ],
  "databaseSchema": [
    { "table": "users", "fields": ["id", "email", "password_hash", "..."] }
  ],
  "suggestedFileStructure": "a markdown-style indented tree as a single string, e.g. src/\\n  controllers/\\n    authController.js\\n  models/\\n    User.js",
  "starterCode": [
    {
      "filePath": "src/controllers/authController.js",
      "language": "javascript",
      "code": "the actual real, working starter code for this file",
      "explanation": "what this file does and why it's structured this way"
    }
  ]
}

Generate starterCode for the 3 most foundational files (e.g. main entry
point, the core model, and the most important controller/route). Write
real, runnable code — not placeholders or comments-only stubs.
`;

function tryParseJSON(text) {
  if (!text) return null;
  try {
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

const generateProjectPlan = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No documentation file uploaded." });
    }

    console.log("===== Documentation Plan Request =====", req.file.originalname);

    const docText = await extractDocumentText(req.file.path);

    if (!docText || docText.trim().length < 20) {
      return res.status(400).json({
        success: false,
        error: "Couldn't extract meaningful text from this document. Try a .txt or .md file.",
      });
    }

    const aiResponse = await askAI(PLAN_PROMPT_TEMPLATE(docText));
    const parsed = tryParseJSON(aiResponse);

    const docPlan = await DocPlan.create({
      documentName: req.file.originalname,
      uploadedFile: req.file.filename,
      rawDocumentText: docText.substring(0, 20000),
      generatedPlan: parsed || {},
      rawAIResponse: parsed ? "" : aiResponse,
    });

    return res.json({
      success: true,
      docPlanId: docPlan._id,
      plan: parsed,
      rawAnswer: parsed ? null : aiResponse, // frontend should render this as markdown if plan is null
    });
  } catch (error) {
    console.error("DOC PLAN ERROR:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

const getProjectPlan = async (req, res) => {
  try {
    const docPlan = await DocPlan.findById(req.params.id);
    if (!docPlan) {
      return res.status(404).json({ success: false, message: "Plan not found" });
    }
    res.json({ success: true, docPlan });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { generateProjectPlan, getProjectPlan };
