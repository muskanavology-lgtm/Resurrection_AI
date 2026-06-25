function architectureDiagramGenerator(
  analysis,
  routes,
  dependencyGraph
) {

  const frontend =
    analysis.frontend || "Frontend";

  const backend =
    analysis.backend || "Backend";

  const database =
    analysis.database || "Database";

  let diagram = `
graph TD

Frontend["${frontend}"]
--> Routes

Routes
--> Controllers

Controllers
--> Services

Services
--> Database["${database}"]
`;

  return {
    mermaid: diagram
  };

}

module.exports =
architectureDiagramGenerator;