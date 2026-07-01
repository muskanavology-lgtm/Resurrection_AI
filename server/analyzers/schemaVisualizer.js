const { buildFileTree } = require("../utils/fileTreeCache");

function schemaVisualizer(projectPathOrTree) {
  const result = {
    collections: [],
    tables: [],
    relationships: [],
  };

  const tree =
    typeof projectPathOrTree === "string"
      ? buildFileTree(projectPathOrTree).files
      : projectPathOrTree.files || projectPathOrTree;

  const modelRegex = /mongoose\.model\s*\(\s*['"`](.*?)['"`]/g;
  const sqlRegex = /CREATE TABLE ([a-zA-Z0-9_]+)/gi;
  const refRegex = /ref\s*:\s*['"`](.*?)['"`]/g;

  for (const file of tree) {
    if (!file.content) continue;
    const content = file.content;
    let match;

    while ((match = modelRegex.exec(content))) {
      result.collections.push(match[1]);
    }

    while ((match = sqlRegex.exec(content))) {
      result.tables.push(match[1]);
    }

    while ((match = refRegex.exec(content))) {
      result.relationships.push({ from: file.relativePath, to: match[1], type: "belongsTo" });
    }
  }

  return result;
}

module.exports = schemaVisualizer;
