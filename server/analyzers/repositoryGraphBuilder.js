const fs = require("fs");
const path = require("path");

function repositoryGraphBuilder(
  dependencyGraph
) {

  const nodes = [];
  const edges = [];

  Object.keys(
    dependencyGraph
  ).forEach(file => {

    nodes.push({
      id: file,
      label: path.basename(file)
    });

    const deps =
      dependencyGraph[file] || [];

    deps.forEach(dep => {

      edges.push({
        source: file,
        target: dep
      });

    });

  });

  return {
    nodes,
    edges
  };

}

module.exports =
repositoryGraphBuilder;