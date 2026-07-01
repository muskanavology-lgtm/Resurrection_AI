const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const askAI = require("../ai/askAI");



const MAX_ROUTES_LISTED = 60;
const MAX_DEPENDENCY_FILES_LISTED = 80;
const MAX_PROMPT_CHARS = 60000; 

function summarizeDependencyGraph(dependencyGraph = {}) {
  const entries = Object.entries(dependencyGraph);
  const sorted = entries
    .map(([file, deps]) => ({ file, depCount: (deps || []).length }))
    .sort((a, b) => b.depCount - a.depCount)
    .slice(0, MAX_DEPENDENCY_FILES_LISTED);

  return {
    totalFilesInGraph: entries.length,
    mostConnectedFiles: sorted,
  };
}

function summarizeRoutes(routes = []) {
  return {
    totalRoutes: routes.length,
    sample: routes.slice(0, MAX_ROUTES_LISTED).map((r) => `${r.method || ""} ${r.path || ""}`),
  };
}

function buildCompactPrompt({ analysis, scanResult, routes, dependencyGraph, feature }) {
  const routeSummary = summarizeRoutes(routes);
  const depSummary = summarizeDependencyGraph(dependencyGraph);

  let prompt = `
You are a Senior Software Architect reviewing a real codebase to plan a new feature.
PROJECT TYPE: ${analysis?.framework || analysis?.architecture || "Unknown"}
LANGUAGES: ${(analysis?.languages || []).join(", ") || "Unknown"}
FRONTEND: ${(analysis?.frontend || []).join(", ") || "none detected"}
BACKEND: ${(analysis?.backend || []).join(", ") || "none detected"}
DATABASE: ${(analysis?.database || []).join(", ") || "none detected"}

PROJECT SCALE:
- Total files: ${scanResult?.totalFiles ?? "unknown"}
- Controllers: ${scanResult?.controllers?.length ?? 0}
- Models: ${scanResult?.models?.length ?? 0}
- Routes: ${routeSummary.totalRoutes}
- Components: ${scanResult?.components?.length ?? 0}

SAMPLE ROUTES (first ${MAX_ROUTES_LISTED} of ${routeSummary.totalRoutes}):
${routeSummary.sample.join("\n") || "(none detected)"}

MOST STRUCTURALLY CONNECTED FILES (top ${MAX_DEPENDENCY_FILES_LISTED} by dependency count, out of ${depSummary.totalFilesInGraph} total files):
${depSummary.mostConnectedFiles.map((f) => `- ${f.file} (${f.depCount} imports)`).join("\n") || "(none detected)"}

---
USER WANTS TO ADD THIS FEATURE:
"${feature}"

TASK: Based on the project type, scale and structure above, identify:
1. Which existing files/layers this feature would most likely touch (be specific using the file list above where relevant, otherwise reason from the project type/framework conventions)
2. What new files would need to be created
3. Why each change is needed
4. Estimated effort (e.g. "2-4 hours", "1-2 days")
5. Risk level (Low/Medium/High) and why

Return ONLY valid JSON, no markdown fences, no preamble, in this exact shape:
{
  "affectedFiles": [],
  "newFiles": [],
  "reason": [],
  "estimatedTime": "",
  "risk": ""
}
`.trim();
  if (prompt.length > MAX_PROMPT_CHARS) {
    prompt = prompt.substring(0, MAX_PROMPT_CHARS) + "\n...(truncated for length)\n";
  }

  return prompt;
}
router.post("/feature-impact/:id", async (req, res) => {
  try {
    const { feature } = req.body;
    if (!feature || !feature.trim()) {
      return res.status(400).json({ success: false, message: "Feature description is required" });
    }
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }
    const prompt = buildCompactPrompt({
      analysis: project.analysis,
      scanResult: project.scanResult,
      routes: project.routes,
      dependencyGraph: project.dependencyGraph,
      feature,
    });
    const answer = await askAI(prompt);
    res.json({
      success: true,
      feature,
      impact: answer,
    });
  } catch (error) {
    console.error("FEATURE IMPACT ERROR:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});
module.exports = router;
