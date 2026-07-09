const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const askAI = require("../ai/askAI");

router.post("/repo-chat", async (req, res) => {
  try {
    const { sessionId, question } = req.body;

    if (!sessionId || !question) {
      return res.status(400).json({
        success: false,
        message: "Missing dynamic workspace context attributes (sessionId/question)."
      });
    }
    const project = await Project.findById(sessionId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Target directory configuration space not found in database registry."
      });
    }
    const techStack = project.techStack || "Not Specified";
    const coreFramework = project.framework || "Unknown Core Archetype";
    const routesRegistered = JSON.stringify(project.routes || [], null, 2);
    const codeAnalysisSummary = JSON.stringify(project.scanResult || {}, null, 2);
    const architecturalBlueprint = project.documentation || "No structural breakdown indexed.";
    const systemIsolationPrompt = `You are an Advanced Technical Lead and Repository Intelligence Executive. 
Your core responsibility is to answer the user's questions about the uploaded codebase with absolute architectural accuracy.

--- CRITICAL BOUNDARY RULES: DO NOT VIOLATE ---
1. STRICT ISOLATION: You must ONLY reference parameters, schemas, variables, and paths discovered within THIS specific repository.
2. NO ASSUMPTIONS: Never hallucinate Javascript/MERN structures (like server.js, app.use, react hooks) if the current repository architecture specifies otherwise (e.g., PHP, Python, or Java). 
3. CROSS-VERIFY: Check file extensions dynamically based on the target system stack setup provided below. If it's a PHP project, answer strictly using PHP structural conventions, controllers, or standard procedural file inclusions.
4. CLEAN OUTPUT FORMATTING: Use Markdown flawlessly. Format multi-line blocks using explicit \`\`\`language code syntaxes. Bold critical modules using **bold text**.

--- CURRENT REPOSITORY ARCHITECTURE METADATA ---
- Project Name: ${project.projectName}
- Core Tech Stack: ${techStack}
- Framework/Archetype: ${coreFramework}
- Indexed Routes / Active Endpoints:
${routesRegistered}
- Code Summary Metrics (Files/Controllers/Components):
${codeAnalysisSummary}
- Extracted Architecture Documentation:
${architecturalBlueprint}
--- USER REQUEST ---
Question: "${question}"
Analyze the context tree metadata accurately and provide a pinpoint, production-grade response addressing the question directly.
`;
    const aiAnswer = await askAI(systemIsolationPrompt);
    return res.json({
      success: true,
      answer: aiAnswer
    });
  } catch (error) {
    console.error("AI Context Layer Execution Crash:", error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
module.exports = router;