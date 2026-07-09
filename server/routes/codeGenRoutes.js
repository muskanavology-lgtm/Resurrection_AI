const express = require("express");
const router = express.Router();
const { generateFeatureCode } = require("../controllers/codeGenController");
// POST /api/generate-code/:id   body: { feature: "Rate Limiting" }
// Returns actual working code files for the requested feature, matching
// this repository's stack — Claude-style: code + explanation, not just advice.
router.post("/generate-code/:id", generateFeatureCode);
module.exports = router;
