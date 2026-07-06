const express = require("express");
const router = express.Router();
const askAI = require("../ai/askAI");
const repoSessions = {};
const RepoChat = require("../models/RepoChat");
router.post("/repo-chat", async (req, res) => {
  try {
    const { sessionId, question, scanResult, dependencyGraph } = req.body;
    if (!sessionId || !question) {
      return res.status(400).json({
        success: false,
        error: "sessionId and question required",
      });
    }
    let chat = await RepoChat.findOne({ sessionId });
    if (!chat) {
      chat = new RepoChat({
        sessionId:Date.now(),
        messages: [],
      });
    }
    const prompt = `You are an expert software architect analyzing a full repository.

PROJECT STRUCTURE:
${JSON.stringify(scanResult, null, 2)}

DEPENDENCY GRAPH:
${JSON.stringify(dependencyGraph, null, 2)}

CHAT HISTORY:
${JSON.stringify(chat.messages, null, 2)}

USER QUESTION:
${question}

Rules:
- Be precise
- Always refer to files
- Explain execution flow
- Think like GitHub Copilot Chat
`;
    const answer = await askAI(prompt);
    chat.messages.push(
      { role: "user", content: question },
      { role: "assistant", content: answer }
    );
    await chat.save();
    console.log("Saving chat...",chat.messages.length);
    return res.json({
      success: true,
      answer,
      sessionId,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});
router.post("/explain-file", async (req, res) => {
  try {
    const { file, scanResult, dependencyGraph } = req.body;
    if (!file) {
      return res.status(400).json({
        success: false,
        error: "file is required",
      });
    }
    const prompt = `You are analyzing ONE specific file from a project.
FILE NAME:
${file}

PROJECT STRUCTURE:
${JSON.stringify(scanResult, null, 2)}

DEPENDENCY GRAPH:
${JSON.stringify(dependencyGraph, null, 2)}

TASK:
Explain ONLY this file in deep detail:

1. What this file does
2. Where it is used in project
3. Which files depend on it
4. Which files it depends on
5. Backend / Frontend role
6. Database impact (if any)
7. Security issues
8. Improvements

Make it very simple and developer friendly.`;
    const answer = await askAI(prompt);
    return res.json({
      success: true,
      file,
      answer,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});
router.post("/explain-file", async (req, res) => {
  try {
    const { file, scanResult, dependencyGraph } = req.body;
    const prompt = `Explain this file in detail:
FILE:
${file}

PROJECT:
${JSON.stringify(scanResult, null, 2)}

DEPENDENCY:
${JSON.stringify(dependencyGraph, null, 2)}

Give:
- what this file does
- where it is used
- backend/frontend role
- security issues
- improvement ideas
`;

    const answer = await askAI(prompt);

    res.json({
      success: true,
      answer,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});
router.post("/ask", async (req, res) => {
  try {
    const { question, scanResult, dependencyGraph } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        error: "question is required",
      });
    }

    const prompt = `
You are analyzing a full codebase.

PROJECT STRUCTURE:
${JSON.stringify(scanResult, null, 2)}

DEPENDENCY GRAPH:
${JSON.stringify(dependencyGraph, null, 2)}

USER QUESTION:
${question}

Explain:
- file structure mapping
- request flow
- backend logic
- frontend interaction
- simple + technical explanation
`;

    const answer = await askAI(prompt);

    return res.json({
      success: true,
      answer,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;