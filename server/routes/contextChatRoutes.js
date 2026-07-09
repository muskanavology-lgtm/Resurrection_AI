const express = require("express");
const router = express.Router();
const ProjectContext = require("../models/ProjectContext");
const askAI = require("../ai/askAI");
router.post("/context-chat/:id",
    async (req, res) => {
        try {
            const { question } = req.body;
            const files = await ProjectContext.find({
                projectId: req.params.id
            }).limit(20);
            const context = files.map(f => `FILE:${f.filePath}${f.content}`).join("\n\n");
            const prompt = `You are analyzinga real repository.
CONTEXT:
${context}
QUESTION:
${question}
Answer using files.
Mention exact file names.`;
            const answer = await askAI(prompt);
            res.json({
                success: true,
                answer
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