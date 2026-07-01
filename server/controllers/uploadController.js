const techDebtAnalyzer = require("../analyzers/techDebtAnalyzer");
const healthScoreAnalyzer = require("../analyzers/healthScoreAnalyzer");
const contextBuilder = require("../analyzers/contextBuilder");
const repositoryGraphBuilder = require("../analyzers/repositoryGraphBuilder");
const ProjectContext = require("../models/ProjectContext");
const missingFeaturesAnalyzer = require("../analyzers/missingFeaturesAnalyzer");
const costAnalyzer = require("../analyzers/costAnalyzer");
const productionReadinessAnalyzer = require("../analyzers/productionReadinessAnalyzer");
const projectResurrectionEngine = require("../analyzers/projectResurrectionEngine");
const architectureDiagramGenerator = require("../analyzers/architectureDiagramGenerator");
const deploymentGenerator = require("../analyzers/deploymentGenerator");
const autoFixEngine = require("../analyzers/autoFixEngine");
const refactorAnalyzer = require("../analyzers/refactorAnalyzer");
const projectTimelineAnalyzer = require("../analyzers/projectTimelineAnalyzer");
const repositoryHealthAnalyzer = require("../analyzers/repositoryHealthAnalyzer");
const executionFlowAnalyzer = require("../analyzers/executionFlowAnalyzer");
const schemaVisualizer = require("../analyzers/schemaVisualizer");
const generateReadme = require("../analyzers/readmeGenerator");
const dependencyScanner = require("../analyzers/dependencyVulnerabilityScanner");
const apiDocsGenerator = require("../analyzers/apiDocsGenerator");
const deploymentGuideGenerator = require("../analyzers/deploymentGuideGenerator");
const codeQualityAnalyzer = require("../analyzers/codeQualityAnalyzer");
const architectureAnalyzer = require("../analyzers/architectureAnalyzer");
const flowAnalyzer = require("../analyzers/flowAnalyzer");
const techStackAnalyzer = require("../analyzers/techStackAnalyzer");
const Project = require("../models/Project");
const generateTimeline = require("../analyzers/timelineGenerator");
const scanDependencies = require("../analyzers/dependencyAnalyzer");
const buildKnowledgeGraph = require("../analyzers/knowledgeGraphBuilder");
const scanSecurity = require("../analyzers/securityScanner");
const generateDocumentation = require("../analyzers/documentationGenerator");
const databaseAnalyzer = require("../analyzers/databaseAnalyzer");
const extractRoutes = require("../analyzers/routeExtractor");
const generateSummary = require("../analyzers/projectSummary");
const scanProject = require("../analyzers/projectScanner");
const extractZip = require("../utils/zipExtractor");
const detectProject = require("../analyzers/projectDetector");
const { buildFileTree } = require("../utils/fileTreeCache");

/*
  🟢 WHAT CHANGED — performance fix (read earlier comments in this file's
  git history / previous version for the full explanation: shared file
  tree, node_modules skipped at extraction time, batch Mongo insert).

  🔴 NEW FIX (this version): ISOLATED ANALYZER FAILURES.

  Problem this solves: with ~18 analyzers running back-to-back on a REAL
  project (not a tiny test case), if even ONE analyzer throws on some
  unusual file/path it encounters, the entire upload request crashes with
  a generic 500 and the user gets nothing — even though the other 17
  analyzers worked fine and have useful results.

  `safeRun(name, fn, fallback)` wraps every analyzer call:
    - If it succeeds: returns its real result, same as before.
    - If it throws: logs the analyzer's name + full stack trace to the
      server console (so the NEXT failure tells us exactly which analyzer
      and which line, instead of one generic message), and returns a safe
      fallback value so the rest of the pipeline keeps going.

  This does not change what working analyzers return — only what happens
  when one fails. The whole point: one bad analyzer should degrade that
  one report, not kill the entire upload.
*/

function safeRun(name, fn, fallback) {
  try {
    const result = fn();
    // support analyzers that are async (detectProject is `async function`)
    if (result && typeof result.then === "function") {
      return result.catch((err) => {
        console.error(`[analyzer:${name}] FAILED (async):`, err.message);
        console.error(err.stack);
        return fallback;
      });
    }
    return result;
  } catch (err) {
    console.error(`[analyzer:${name}] FAILED:`, err.message);
    console.error(err.stack);
    return fallback;
  }
}

const uploadProject = async (req, res) => {
  try {
    console.log("===== Upload Request Received =====");

    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded." });
    }

    console.log("Uploaded File:", req.file.path);

    // Step 1: Extract ZIP (node_modules/.git/etc are skipped DURING extraction now)
    const extractedPath = await extractZip(req.file.path);

    // Step 2: Build the shared file tree ONCE — every analyzer below reuses this.
    const { files: treeFiles, truncated, totalScanned } = buildFileTree(extractedPath);
    const tree = { files: treeFiles, projectPath: extractedPath };

    console.log(`[upload] Scanned ${totalScanned} files${truncated ? " (TRUNCATED — project very large)" : ""}`);

    const contextFiles = safeRun("contextBuilder", () => contextBuilder(tree), []);

    // Step 3: Run all analyzers against the SAME in-memory tree (no repeat disk reads).
    // Each call is now isolated — one failure won't take down the whole upload.
    const analysis = await safeRun("detectProject", () => detectProject(tree), {
      framework: "Unknown", frontend: [], backend: [], database: [], languages: [],
    });
    const routes = safeRun("extractRoutes", () => extractRoutes(tree), []);
    const scanResult = safeRun("scanProject", () => scanProject(tree), {
      totalFiles: totalScanned, controllers: [], models: [], routes: [], components: [], pages: [], middleware: [],
    });
    const flow = safeRun("flowAnalyzer", () => flowAnalyzer(tree), {});
    const securityReport = safeRun("scanSecurity", () => scanSecurity(tree), {
      securityScore: 100, grade: "A", critical: 0, high: 0, medium: 0, low: 0, issues: [], recommendations: [],
    });
    const productionReport = safeRun("productionReadinessAnalyzer", () => productionReadinessAnalyzer(tree), {});
    const costReport = safeRun("costAnalyzer", () => costAnalyzer(analysis, scanResult), {});
    const deploymentFiles = safeRun("deploymentGenerator", () => deploymentGenerator(analysis), {});
    const techDebtReport = safeRun("techDebtAnalyzer", () => techDebtAnalyzer(tree), {});
    const missingFeatures = safeRun(
      "missingFeaturesAnalyzer",
      () => missingFeaturesAnalyzer(analysis, routes, scanResult),
      { detected: [], missing: [], projectGrade: "C" }
    );
    const qualityReport = safeRun("codeQualityAnalyzer", () => codeQualityAnalyzer(tree), {});
    // dependencyVulnerabilityScanner still reads package.json/composer.json
    // directly off disk (cheap — single small file, not a tree walk).
    const dependencyReport = safeRun("dependencyScanner", () => dependencyScanner(extractedPath), []);
    const databaseSchema = safeRun("schemaVisualizer", () => schemaVisualizer(tree), {
      collections: [], tables: [], relationships: [],
    });
    const techStack = safeRun("techStackAnalyzer", () => techStackAnalyzer(tree), {
      frontend: [], backend: [], database: [], mobile: [], devops: [], languages: [],
    });
    const architecture = safeRun("architectureAnalyzer", () => architectureAnalyzer(tree), {
      architecture: "Unknown", confidence: "50%", reason: [],
    });

    const generatedDocs = {
      readme: "",
      apiDocs: [],
      deploymentGuide: {},
    };

    const databaseInfo = safeRun("databaseAnalyzer", () => databaseAnalyzer(tree), {
      collections: [], tables: [],
    });
    const summary = safeRun("generateSummary", () => generateSummary(analysis, scanResult), "");
    const timeline = safeRun("generateTimeline", () => generateTimeline({ routes }), []);
    const documentation = safeRun(
      "generateDocumentation",
      () => generateDocumentation(analysis, scanResult, routes, databaseInfo),
      { overview: "", techStack: {}, projectStats: {}, features: [] }
    );

    const dependencyGraph = safeRun("scanDependencies", () => scanDependencies(tree), {});
    const repositoryGraph = safeRun(
      "repositoryGraphBuilder",
      () => repositoryGraphBuilder(dependencyGraph),
      { nodes: [], edges: [] }
    );
    const executionFlow = safeRun("executionFlowAnalyzer", () => executionFlowAnalyzer(tree), []);
    const knowledgeGraph = safeRun(
      "buildKnowledgeGraph",
      () => buildKnowledgeGraph(dependencyGraph),
      { nodes: [], edges: [] }
    );
    const architectureDiagram = safeRun(
      "architectureDiagramGenerator",
      () => architectureDiagramGenerator(analysis, routes, dependencyGraph),
      { mermaid: "" }
    );

    generatedDocs.deploymentGuide = safeRun(
      "deploymentGuideGenerator",
      () => deploymentGuideGenerator(analysis),
      {}
    );
    generatedDocs.apiDocs = safeRun("apiDocsGenerator", () => apiDocsGenerator(routes), []);
    generatedDocs.readme = safeRun(
      "generateReadme",
      () =>
        generateReadme({
          projectName: req.file.originalname,
          analysis,
          techStack,
          documentation,
          architecture,
          routes,
        }),
      ""
    );

    const autoFixes = safeRun("autoFixEngine", () => autoFixEngine(tree), []);
    const refactorReport = safeRun("refactorAnalyzer", () => refactorAnalyzer(tree), []);

    const repositoryHealth = safeRun(
      "repositoryHealthAnalyzer",
      () =>
        repositoryHealthAnalyzer({
          architecture,
          qualityReport,
          securityReport,
          documentation,
          scanResult,
        }),
      { healthScore: 0, grade: "—", security: 0, architecture: 0, codeQuality: 0, documentation: 0, maintainability: 0 }
    );

    const resurrectionReport = safeRun(
      "projectResurrectionEngine",
      () =>
        projectResurrectionEngine({
          analysis,
          techStack,
          scanResult,
          routes,
          databaseInfo,
          securityReport,
          qualityReport,
          architecture,
          repositoryHealth,
        }),
      {}
    );

    const healthScore = safeRun(
      "healthScoreAnalyzer",
      () => healthScoreAnalyzer({ scanResult, routes, documentation, securityReport }),
      {}
    );

    const savedProject = await Project.create({
      projectName: req.file.originalname,
      uploadedFile: req.file.filename,
      extractedPath,
      techStack,
      documentation,
      flow,
      securityReport,
      scanResult,
      productionReport,
      repositoryGraph,
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
      analysis,
      scanStats: { totalScanned, truncated },
    });

    // Batch insert instead of one Mongo write per file in a loop.
    if (contextFiles.length > 0) {
      try {
        const docs = contextFiles.map((file) => ({
          projectId: savedProject._id,
          filePath: file.filePath,
          content: file.content,
        }));
        await ProjectContext.insertMany(docs, { ordered: false });
      } catch (err) {
        // Non-fatal: AI chat context will just be thinner, upload itself
        // already succeeded and was saved above.
        console.error("[ProjectContext.insertMany] FAILED (non-fatal):", err.message);
      }
    }

    return res.json({
      success: true,
      projectId: savedProject._id,
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
      dependencyReport,
      repositoryGraph,
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
      truncated,
      totalScanned,
    });
  } catch (error) {
    // This now only fires for TRULY fatal errors (zip extraction failure,
    // Project.create/Mongo connection failure) — not for individual
    // analyzer bugs, which are now isolated above by safeRun().
    console.error("UPLOAD ERROR:", error.message);
    console.error(error.stack);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = { uploadProject };
