const path = require("path");

function resolveImportPath(fromFile, importPath, allNodeIds) {
 
  if (!importPath.startsWith(".")) return null;

  const fromDir = path.dirname(fromFile);
  const resolvedBase = path.resolve(fromDir, importPath);

  const candidates = [
    resolvedBase,
    `${resolvedBase}.js`,
    `${resolvedBase}.jsx`,
    `${resolvedBase}.ts`,
    `${resolvedBase}.tsx`,
    path.join(resolvedBase, "index.js"),
    path.join(resolvedBase, "index.jsx"),
  ];

  for (const candidate of candidates) {
   
    const norm = path.normalize(candidate);
    if (allNodeIds.has(norm)) return norm;
  }

  return null;
}

function buildKnowledgeGraph(dependencyGraph = {}) {
  const nodes = [];
  const edges = [];

  const files = Object.keys(dependencyGraph);
  const allNodeIds = new Set(files.map((f) => path.normalize(f)));

  files.forEach((file) => {
    const normFile = path.normalize(file);
    nodes.push({ id: normFile, label: normFile });

    const deps = dependencyGraph[file] || [];
    deps.forEach((dep) => {
      if (typeof dep !== "string" || !dep.trim()) return;
      const resolved = resolveImportPath(file, dep, allNodeIds);
      if (resolved && resolved !== normFile) {
        edges.push({ source: normFile, target: resolved });
      }

    });
  });

  return { nodes, edges };
}

module.exports = buildKnowledgeGraph;
