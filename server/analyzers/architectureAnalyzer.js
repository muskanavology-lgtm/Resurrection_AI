const fs = require("fs");
const path = require("path");

function architectureAnalyzer(projectPath) {

  const result = {
    architecture: "Unknown",
    confidence: "50%",
    reason: []
  };

  let folders = [];

  function scan(dir) {

    const files = fs.readdirSync(dir);

    for (const file of files) {

      const fullPath = path.join(dir, file);

      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {

        folders.push(file.toLowerCase());

        scan(fullPath);
      }
    }
  }

  scan(projectPath);

  // MVC

  if (
    folders.includes("controllers") &&
    folders.includes("models") &&
    folders.includes("routes")
  ) {

    result.architecture = "MVC";

    result.confidence = "96%";

    result.reason.push(
      "controllers folder found"
    );

    result.reason.push(
      "models folder found"
    );

    result.reason.push(
      "routes folder found"
    );

    return result;
  }

  // MVVM

  if (
    folders.includes("viewmodels") ||
    folders.includes("viewmodel")
  ) {

    result.architecture = "MVVM";

    result.confidence = "90%";

    result.reason.push(
      "viewmodel folder found"
    );

    return result;
  }

  // Clean Architecture

  if (
    folders.includes("domain") &&
    folders.includes("application") &&
    folders.includes("infrastructure")
  ) {

    result.architecture =
      "Clean Architecture";

    result.confidence = "95%";

    result.reason.push(
      "domain layer found"
    );

    result.reason.push(
      "application layer found"
    );

    result.reason.push(
      "infrastructure layer found"
    );

    return result;
  }

  // Hexagonal

  if (
    folders.includes("ports") &&
    folders.includes("adapters")
  ) {

    result.architecture =
      "Hexagonal Architecture";

    result.confidence = "95%";

    result.reason.push(
      "ports found"
    );

    result.reason.push(
      "adapters found"
    );

    return result;
  }

  // Layered

  if (
    folders.includes("service") ||
    folders.includes("services")
  ) {

    result.architecture =
      "Layered Architecture";

    result.confidence = "80%";

    result.reason.push(
      "services layer found"
    );

    return result;
  }

  return result;
}

module.exports =
  architectureAnalyzer;