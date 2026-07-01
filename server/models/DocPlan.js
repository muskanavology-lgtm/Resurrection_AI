const mongoose = require("mongoose");

/*
  NAYA FEATURE: jab koi developer ke paas sirf DOCUMENTATION hai, project
  abhi bana nahi hai — user wo documentation upload kar sakta hai, aur AI
  uska poora project plan generate karta hai (modules, frontend, backend,
  files structure, even starter code).

  Ye alag model hai Project se kyunki ismein scanResult/securityReport jaisi
  cheezein nahi hoti (koi code hi nahi hai scan karne ke liye) — sirf AI ka
  generated plan store hota hai.
*/

const DocPlanSchema = new mongoose.Schema({
  documentName: String,
  uploadedFile: String,
  rawDocumentText: String, // extracted text from the uploaded doc (txt/md/pdf/docx)

  generatedPlan: {
    summary: String,
    suggestedFramework: String, // e.g. "MERN", "Laravel", "Django"
    modules: [
      {
        name: String,
        description: String,
        priority: String, // High / Medium / Low
      },
    ],
    frontendPages: [String],
    backendRoutes: [
      {
        method: String,
        path: String,
        purpose: String,
      },
    ],
    databaseSchema: [
      {
        table: String,
        fields: [String],
      },
    ],
    suggestedFileStructure: String, // markdown tree, e.g. "src/\n  controllers/\n    authController.js"
    starterCode: [
      {
        filePath: String,
        language: String,
        code: String,
        explanation: String,
      },
    ],
  },

  rawAIResponse: String, // fallback: full raw AI text if JSON parsing fails

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("DocPlan", DocPlanSchema);
