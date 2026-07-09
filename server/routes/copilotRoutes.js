const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const askAI = require("../ai/askAI");
const copilotAnalyzer = require("../analyzers/copilotAnalyzer");
router.post("/copilot", async (req, res) => {
    try {
        const { projectId, question } = req.body;
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }
        const findings = await copilotAnalyzer(project, question);
        const prompt = `You are a Senior Software Architect.
QUESTION:${question}
RELEVANT FILES:${JSON.stringify(findings, null, 2)}

Explain:
1 File Name
2 Why Relevant
3 Execution Flow
4 Improvement Ideas
5 Security Issues`;

        const answer = await askAI(prompt);
        res.json({
            success: true,
            answer,
            findings
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