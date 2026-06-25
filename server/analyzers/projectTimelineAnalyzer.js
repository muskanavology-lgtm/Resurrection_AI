const fs = require("fs");
const path = require("path");

function projectTimelineAnalyzer(scanResult, routes) {

  const timeline = [];

  // Phase 1

  if (
    scanResult.models.length > 0
  ) {

    timeline.push({
      phase: "Phase 1",
      module: "Database Design",
      reason:
        "Models detected"
    });

  }

  // Phase 2

  if (
    routes.some(r =>
      r.path.includes("login")
    )
  ) {

    timeline.push({
      phase: "Phase 2",
      module: "Authentication",
      reason:
        "Login APIs found"
    });

  }

  // Phase 3

  if (
    scanResult.controllers.length > 0
  ) {

    timeline.push({
      phase: "Phase 3",
      module: "Business Logic",
      reason:
        "Controllers detected"
    });

  }

  // Phase 4

  if (
    scanResult.routes.length > 0
  ) {

    timeline.push({
      phase: "Phase 4",
      module: "API Layer",
      reason:
        "Routes detected"
    });

  }

  // Phase 5

  if (
    scanResult.components.length > 0
  ) {

    timeline.push({
      phase: "Phase 5",
      module: "Frontend UI",
      reason:
        "React Components detected"
    });

  }

  // Phase 6

  if (
    scanResult.pages.length > 0
  ) {

    timeline.push({
      phase: "Phase 6",
      module: "Application Pages",
      reason:
        "Pages detected"
    });

  }

  return timeline;
}

module.exports =
projectTimelineAnalyzer;