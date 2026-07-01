const { buildFileTree } = require("../utils/fileTreeCache");
const path = require("path");
function architectureAnalyzer(projectPathOrTree) {
  const result = {
    architecture: "Unknown",
    confidence: "50%",
    reason: [],
  };

  const tree =
    typeof projectPathOrTree === "string"
      ? buildFileTree(projectPathOrTree).files
      : projectPathOrTree.files || projectPathOrTree;

  const folders = new Set();
  for (const file of tree) {
    const dir = path.dirname(file.relativePath);
    dir.split(/[/\\]/).forEach((segment) => {
      if (segment && segment !== ".") folders.add(segment.toLowerCase());
    });
  }

  if (folders.has("controllers") && folders.has("models") && folders.has("routes")) {
    result.architecture = "MVC";
    result.confidence = "96%";
    result.reason.push("controllers folder found", "models folder found", "routes folder found");
    return result;
  }

  if (folders.has("viewmodels") || folders.has("viewmodel")) {
    result.architecture = "MVVM";
    result.confidence = "90%";
    result.reason.push("viewmodel folder found");
    return result;
  }

  if (folders.has("domain") && folders.has("application") && folders.has("infrastructure")) {
    result.architecture = "Clean Architecture";
    result.confidence = "95%";
    result.reason.push("domain layer found", "application layer found", "infrastructure layer found");
    return result;
  }

  if (folders.has("ports") && folders.has("adapters")) {
    result.architecture = "Hexagonal Architecture";
    result.confidence = "95%";
    result.reason.push("ports found", "adapters found");
    return result;
  }

  if (folders.has("service") || folders.has("services")) {
    result.architecture = "Layered Architecture";
    result.confidence = "80%";
    result.reason.push("services layer found");
    return result;
  }

  
  if (folders.has("wp-content") && folders.has("wp-admin") && folders.has("wp-includes")) {
    result.architecture = "WordPress (Plugin/Theme Driven)";
    result.confidence = "97%";
    result.reason.push("wp-content found", "wp-admin found", "wp-includes found");
    return result;
  }

  if (folders.has("app") && folders.has("routes") && (folders.has("eloquent") || folders.has("providers"))) {
    result.architecture = "Laravel MVC";
    result.confidence = "92%";
    result.reason.push("app/ found", "routes/ found", "providers/ found");
    return result;
  }

  return result;
}

module.exports = architectureAnalyzer;
