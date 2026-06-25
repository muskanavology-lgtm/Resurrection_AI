const express = require("express");
const router = express.Router();
const projectComparator = require("../analyzers/projectComparator");
const Project = require("../models/Project");
const ChatSession = require("../models/ChatSession");

/*
  ⚠️ IMPORTANT FIX (read this comment block):
  Pehle "/:id" route sabse upar tha. Express routes ko TOP-TO-BOTTOM order mein
  match karta hai, aur "/:id" EK SINGLE WORD wale kisi bhi path ko pakad leta tha —
  jaise "/api/projects" bhi isi route se match ho raha tha (id = "projects"),
  jiski wajah se Project.findById("projects") fail hota tha aur list kabhi
  return hi nahi hoti thi.

  FIX: saari specific named routes (jaise /projects, /project/:id, /security/:id
  wagera) ko UPAR rakha hai, aur generic "/:id" ko sabse NEECHE/end mein.
  Isse koi bhi specific route "/:id" ke trap mein nahi aayega.

  Maine sirf ORDER change kiya hai — koi bhi logic, field name, ya response
  shape nahi badla. Saare existing endpoints same tarike se kaam karenge.
*/

// ===================== LIST ALL PROJECTS (moved up, now reachable) =====================
router.get("/projects", async (req, res) => {
  try {
    const projects = await Project.find({}).sort({ createdAt: -1 });
    res.json({
      success: true,
      projects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ===================== SINGLE PROJECT (both singular + plural kept for compatibility) =====================
router.get("/project/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }
    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/projects/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }
    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete("/projects/:id", async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Project Deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===================== ALL REPORT SUB-ROUTES =====================
router.get("/security/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false });
    }
    res.json({ success: true, securityReport: project.securityReport });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/mermaid/:id", async (req, res) => {
  try {
    await Project.findById(req.params.id);
    const diagram = `
graph TD

Frontend --> Routes
Routes --> Controllers
Controllers --> Services
Services --> Models
Models --> Database
`;
    res.json({ success: true, mermaid: diagram });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/flow/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    res.json({ success: true, flow: project.flow });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/production/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    res.json({ success: true, production: project.productionReport });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/tech-stack/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    res.json({ success: true, techStack: project.techStack });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/cost/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    res.json({ success: true, cost: project.costReport });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/dashboard/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }
    res.json({
      success: true,
      overview: project.analysis,
      stats: {
        files: project.scanResult?.totalFiles || 0,
        controllers: project.scanResult?.controllers?.length || 0,
        models: project.scanResult?.models?.length || 0,
        routes: project.routes?.length || 0,
        components: project.scanResult?.components?.length || 0,
        pages: project.scanResult?.pages?.length || 0,
      },
      documentation: project.documentation,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/chat-history/:projectId", async (req, res) => {
  try {
    const chat = await ChatSession.findOne({ projectId: req.params.projectId });
    res.json({ success: true, history: chat?.messages || [] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/architecture/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    res.json({ success: true, architecture: project.architecture });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/quality/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    res.json({ success: true, quality: project.qualityReport });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/docs/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    res.json({ success: true, docs: project.generatedDocs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/deployment/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    res.json({ success: true, deployment: project.deploymentFiles });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/tech-debt/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    res.json({ success: true, techDebt: project.techDebtReport });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/missing-features/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    res.json({ success: true, report: project.missingFeatures });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/dependencies/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    res.json({ success: true, dependencies: project.dependencyReport });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/database-schema/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    res.json({ success: true, schema: project.databaseSchema });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/execution-flow/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    res.json({ success: true, flow: project.executionFlow });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/health/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    res.json({ success: true, health: project.repositoryHealth });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/timeline/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    res.json({ success: true, timeline: project.timeline });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/auto-fixes/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    res.json({ success: true, fixes: project.autoFixes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/compare/:projectA/:projectB", async (req, res) => {
  try {
    const projectA = await Project.findById(req.params.projectA);
    const projectB = await Project.findById(req.params.projectB);
    if (!projectA || !projectB) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }
    const result = projectComparator(projectA, projectB);
    res.json({ success: true, comparison: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/refactor/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }
    res.json({ success: true, refactorReport: project.refactorReport || [] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/architecture-diagram/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    res.json({ success: true, diagram: project.architectureDiagram });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/resurrection/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    res.json({ success: true, report: project.resurrectionReport });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===================== GENERIC CATCH-ALL (MUST STAY LAST) =====================
router.get("/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }
    res.json({ success: true, project });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
