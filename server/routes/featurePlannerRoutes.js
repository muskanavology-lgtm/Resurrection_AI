const express = require("express");
const router = express.Router();
const askAI = require("../ai/askAI");

router.post("/plan-feature", async (req, res) => {
  try {

    const { project, feature } = req.body;

    if (!feature) {
      return res.status(400).json({
        success: false,
        error: "Feature is required"
      });
    }

    const prompt = `
You are a senior system architect.

A developer wants to add a new feature to an existing project.

PROJECT STRUCTURE:
${JSON.stringify(project, null, 2)}

NEW FEATURE:
${feature}

TASK:
Explain EXACTLY where to make changes:

1. Backend files
2. Frontend files
3. Database changes
4. Security changes
5. API routes
6. Step-by-step implementation

Be very precise and practical like GitHub Copilot + Staff Engineer.
`;

    const plan = await askAI(prompt);

    return res.json({
      success: true,
      plan
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

module.exports = router;