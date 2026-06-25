const fs = require("fs");

const askGemini =
require("../services/geminiService");

const aiExplainFile =
async (req, res) => {

  try {

    const { filePath } = req.body;

    const content =
      fs.readFileSync(
        filePath,
        "utf8"
      );

    const prompt = `
You are a senior software architect.

Explain this file:

${content}

Provide:

1 Purpose
2 Main Functions
3 Dependencies
4 Security Issues
5 Summary
`;

    const answer =
      await askGemini(prompt);

    res.json({
      success: true,
      explanation: answer
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    });

  }

};

module.exports = {
  aiExplainFile
};