const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const askAI = require("../ai/askAI");
router.post("/change-plan/:id",
  async (req, res) => {
    try {
      const { feature } = req.body;
      const project = await Project.findById(req.params.id);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: "Project not found"
        });
      }
      const prompt = `You are a Senior Software Architect.
PROJECT ANALYSIS:
${JSON.stringify(project.analysis, null, 2)}
PROJECT STRUCTURE:
${JSON.stringify(project.scanResult, null, 2)}
ROUTES:
${JSON.stringify(project.routes, null, 2)}
DEPENDENCY GRAPH:
${JSON.stringify(project.dependencyGraph, null, 2)}
FEATURE TO ADD:
${feature}
Generate JSON:
{
  "filesToModify":[],
  "filesToCreate":[],
  "estimatedTime":"",
  "risk":"",
  "implementationSteps":[]
}
Think deeply.`;
      const answer = await askAI(prompt);
      res.json({
        success: true,
        feature,
        plan: answer
      });
    }
    catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
module.exports = router;