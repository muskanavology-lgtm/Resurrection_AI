const fs = require("fs");
const path = require("path");

function costAnalyzer(
  analysis,
  scanResult
) {

  let projectSize = "Small";

  if (
    scanResult.totalFiles > 1000
  ) {
    projectSize = "Large";
  }
  else if (
    scanResult.totalFiles > 300
  ) {
    projectSize = "Medium";
  }

  let hosting = "Railway";
  let estimatedCost = "$5-$15/month";

  const reasons = [];

  if (
    analysis.backend?.includes("Express")
  ) {

    reasons.push(
      "Node.js Backend Detected"
    );

  }

  if (
    analysis.database?.includes("MongoDB")
  ) {

    reasons.push(
      "MongoDB Detected"
    );

  }

  if (
    projectSize === "Large"
  ) {

    hosting = "AWS";

    estimatedCost =
      "$50-$200/month";

  }

  return {

    projectSize,

    hosting,

    estimatedCost,

    recommendedDeployment:
      `${hosting} + Database`,

    alternatives: [
      "Render",
      "Fly.io",
      "Vercel",
      "AWS"
    ],

    reasons

  };

}

module.exports =
costAnalyzer;