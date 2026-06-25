const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
  projectName: String,
  uploadedFile: String,
  extractedPath: String,

  analysis: Object,
  techStack:Object,
  flow:Object,
  scanResult: Object,
  qualityReport:Object,
  costReport:Object,
securityReport:Object,
dependencyReport:Array,
databaseSchema:Object,
  routes: Array,
  deploymentFiles:Object,
  techDebtReport:Object,
  missingFeatures:Object,
  generatedDocs:Object,
  architecture:Object,
  executionFlow:Object,
  execution:Object,
  healthScore:Object,
  databaseInfo: Object,
  productionReport:Object,repositoryGraph:Object,
  timeline:Array,
  autoFixes:Array,
  architectureDiagram:Object,
  resurrectionReport:Object,
  documentation: Object,
  refactorReport:Array,
  repositoryHealth:Object,
executionFlow:Array,
  dependencyGraph: Object,
  knowledgeGraph: Object,

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports =
mongoose.model(
  "Project",
  ProjectSchema
);