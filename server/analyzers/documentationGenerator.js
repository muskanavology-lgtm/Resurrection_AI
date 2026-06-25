function generateDocumentation(analysis, scanResult, routes, databaseInfo) {
  const docs = {
    overview: `This is a ${analysis.framework || "Custom Stack"} based application mapping architecture components.`,
    framework: analysis.framework || "Unknown Custom Stack",
    database: analysis.database && analysis.database.length > 0 ? analysis.database : ["Local Files/Schema Engine"],
    languages: analysis.languages || [],
    frontend: analysis.frontend || [],
    backend: analysis.backend || [],
    projectStats: {
      totalFiles: scanResult?.totalFiles || 0,
      controllers: scanResult?.controllers?.length || 0,
      models: scanResult?.models?.length || 0,
      routes: routes?.length || 0,
      components: scanResult?.components?.length || 0,
      pages: scanResult?.pages?.length || 0
    }
  };

  return docs;
}

module.exports = generateDocumentation;