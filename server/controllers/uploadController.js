const techDebtAnalyzer =
require(
"../analyzers/techDebtAnalyzer"
);
const healthScoreAnalyzer =
require(
"../analyzers/healthScoreAnalyzer"
);
const contextBuilder =
require(
"../analyzers/contextBuilder"
);
const repositoryGraphBuilder =
require(
"../analyzers/repositoryGraphBuilder"
);
const ProjectContext =
require(
"../models/ProjectContext"
);
const missingFeaturesAnalyzer =
require(
"../analyzers/missingFeaturesAnalyzer"
);
const costAnalyzer =
require(
"../analyzers/costAnalyzer"
);
const productionReadinessAnalyzer =
require(
"../analyzers/productionReadinessAnalyzer"
);
const projectResurrectionEngine =
require(
"../analyzers/projectResurrectionEngine"
);
console.log(require.resolve(
  "../analyzers/projectResurrectionEngine"
));
const architectureDiagramGenerator =
require(
"../analyzers/architectureDiagramGenerator"
);
const deploymentGenerator =
require(
"../analyzers/deploymentGenerator"
);
const autoFixEngine =
require(
"../analyzers/autoFixEngine"
);
const refactorAnalyzer =
require(
"../analyzers/refactorAnalyzer"
);
const projectTimelineAnalyzer =
require(
"../analyzers/projectTimelineAnalyzer"
);
const repositoryHealthAnalyzer =
require(
"../analyzers/repositoryHealthAnalyzer"
);
const executionFlowAnalyzer =
require(
"../analyzers/executionFlowAnalyzer"
);
const schemaVisualizer =
require(
"../analyzers/schemaVisualizer"
);
const generateReadme =
require(
"../analyzers/readmeGenerator"
);
const dependencyScanner =
require(
"../analyzers/dependencyVulnerabilityScanner"
);
const apiDocsGenerator =
require(
"../analyzers/apiDocsGenerator"
);

const deploymentGuideGenerator =
require(
"../analyzers/deploymentGuideGenerator"
);console.log(
"deploymentGuideGenerator =",
deploymentGuideGenerator
);
const codeQualityAnalyzer =
require(
"../analyzers/codeQualityAnalyzer"
);
const architectureAnalyzer =
require("../analyzers/architectureAnalyzer");
const securityAnalyzer =
require(
"../analyzers/securityAnalyzer"
);
const flowAnalyzer =
require("../analyzers/flowAnalyzer");
const techStackAnalyzer =
require("../analyzers/techStackAnalyzer");
const Project =require("../models/Project");
const generateTimeline =
require("../analyzers/timelineGenerator");
const scanDependencies =
require("../analyzers/dependencyAnalyzer");
const buildKnowledgeGraph =
require("../analyzers/knowledgeGraphBuilder");
const scanSecurity =
require("../analyzers/securityScanner");
const generateDocumentation =require("../analyzers/documentationGenerator");
const databaseAnalyzer = require("../analyzers/databaseAnalyzer");
const extractRoutes = require("../analyzers/routeExtractor");
const generateSummary = require("../analyzers/projectSummary");
const scanProject = require("../analyzers/projectScanner");
const extractZip = require("../utils/zipExtractor");
console.log("extractZip =", extractZip);
const detectProject = require("../analyzers/projectDetector");

const uploadProject = async (req, res) => {
  try {
    console.log("===== Upload Request Received =====");

  // Extraction parse function ke andar code scan karte waqt:
// Kisi bhi recursive scan function ya loop ke andar hi iska use karein:
function scanDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    // ✅ SAHI: Loop ke andar continue bilkul perfectly chalega
    if (
      file === "node_modules" || 
      file === ".git" || 
      file === "vendor" || 
      file === "dist" || 
      file === "build" || 
      file === ".next"
    ) {
      continue; 
    }

    // Baaki ka scanning logic...
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDirectory(fullPath);
    }
  }
}

    console.log("Uploaded File:", req.file.path);

    // Step 1: Extract ZIP
    const extractedPath = await extractZip(req.file.path);
    const contextFiles =
contextBuilder(
extractedPath
);
    // Step 2: Detect Project
const analysis = await detectProject(extractedPath);
const routes = extractRoutes(extractedPath);
const scanResult =
scanProject(extractedPath);
const flow =
flowAnalyzer(
extractedPath
);
const securityReport =
securityAnalyzer(
extractedPath
);const productionReport =
productionReadinessAnalyzer(
extractedPath
);
const costReport =
costAnalyzer(
analysis,
scanResult
);
const deploymentFiles =
deploymentGenerator(
analysis
);
const techDebtReport =
techDebtAnalyzer(
extractedPath
);
const missingFeatures =
missingFeaturesAnalyzer(
  analysis,
  routes,
  scanResult
);
const qualityReport =
codeQualityAnalyzer(
extractedPath
);
const dependencyReport =
dependencyScanner(
extractedPath
);
const databaseSchema =
schemaVisualizer(
extractedPath
);
const techStack =
techStackAnalyzer(
  extractedPath
);
const architecture =
architectureAnalyzer(
extractedPath
);
const generatedDocs = {

readme: "",

apiDocs: [],

deploymentGuide: {}

};

const databaseInfo =databaseAnalyzer(extractedPath);
    const summary = generateSummary(analysis, scanResult);
const timeline =
generateTimeline({
  routes
});
const documentation =
generateDocumentation(
  analysis,
  scanResult,
  routes,
  databaseInfo
);
// Dependency Graph
const dependencyGraph =
scanDependencies(extractedPath);

const repositoryGraph =
repositoryGraphBuilder(
dependencyGraph
);
// Knowledge Graph
const executionFlow=executionFlowAnalyzer(extractedPath);
const knowledgeGraph =buildKnowledgeGraph(dependencyGraph);
const architectureDiagram =
architectureDiagramGenerator(
analysis,
routes,
dependencyGraph
);
const securityIssues =scanSecurity(extractedPath);
generatedDocs.deploymentGuide =
deploymentGuideGenerator(
analysis
);
generatedDocs.apiDocs =
apiDocsGenerator(
routes
);

generatedDocs.readme =
generateReadme({

projectName:
req.file.originalname,

analysis,

techStack,

documentation,

architecture,

routes

});
const timeline2 =
projectTimelineAnalyzer(
scanResult,
routes
);
const autoFixes =
autoFixEngine(
extractedPath
);const refactorReport =
refactorAnalyzer(
extractedPath
);

const repositoryHealth =
repositoryHealthAnalyzer({

architecture,

qualityReport,

securityReport,

documentation,

scanResult

});

const resurrectionReport =
projectResurrectionEngine({
analysis,
techStack,
scanResult,
routes,
databaseInfo,
securityReport,
qualityReport,
architecture,
repositoryHealth});

const healthScore =
healthScoreAnalyzer({
  scanResult,
  routes,
  documentation,
  securityReport
});
const savedProject =await Project.create({
 
  projectName:
    req.file.originalname,

  uploadedFile:
    req.file.filename,

  extractedPath,
techStack,
  documentation,
flow,
securityReport,
  scanResult,
  productionReport,repositoryGraph,
  costReport,
architecture,
  routes,
qualityReport,
generatedDocs,
dependencyReport,
healthScore,
deploymentFiles,
techDebtReport,
missingFeatures,
databaseSchema,
executionFlow,
timeline,
autoFixes,
architectureDiagram,
resurrectionReport,
  databaseInfo,
repositoryHealth,

refactorReport,
  dependencyGraph,

  knowledgeGraph,
  analysis
});
for(
const file of contextFiles
){

await ProjectContext.create({

projectId:
savedProject._id,

filePath:
file.filePath,

content:
file.content

});

}
return res.json({
  success: true,
  projectId:
    savedProject._id,
  uploadedFile: req.file.filename,
  extractedPath,
techStack,
flow,
securityReport,
architecture,

  scanResult,
  productionReport,
  costReport,
  summary,
  routes,
  qualityReport,
  healthScore,
  dependencyReport,repositoryGraph,
  databaseSchema,
  executionFlow,
  deploymentFiles,
  techDebtReport,
  missingFeatures,
  timeline,
  autoFixes,
  architectureDiagram,
  resurrectionReport,
  databaseInfo,
  documentation,
  refactorReport,
repositoryHealth,
  dependencyGraph,
  knowledgeGraph,
    analysis,
  securityIssues
  
});


  }
   catch (error) 
  {
    console.error("UPLOAD ERROR:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = { uploadProject };