const Project = require("../models/Project");

const getDashboard = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }
    return res.json({
      success: true,
      projectName: project.projectName,
      analysis: project.analysis,
      scanResult: project.scanResult,
      routes: project.routes,
      databaseInfo: project.databaseInfo,
      documentation: project.documentation,
      techStack: project.techStack,
      stats: {
        components: project.scanResult?.components || project.stats?.components || 0,
        controllers: project.scanResult?.controllers || project.stats?.controllers || 0,
        files: project.scanResult?.files || project.stats?.files || 0,
        models: project.scanResult?.models || project.stats?.models || 0,
        pages: project.scanResult?.pages || project.stats?.pages || 0,
        routes: project.routes?.length || project.stats?.routes || 0
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = { getDashboard };