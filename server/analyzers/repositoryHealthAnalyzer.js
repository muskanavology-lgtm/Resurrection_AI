function repositoryHealthAnalyzer({

  architecture,

  qualityReport,

  securityReport,

  documentation,

  scanResult

}) {

  let security = 100;
  let architectureScore = 100;
  let codeQuality = 100;
  let docs = 100;
  let maintainability = 100;

  // Security

  security -=
    (securityReport?.length || 0) * 5;

  // Quality

  security =
    Math.max(0, security);

  if (
    qualityReport?.complexity ===
    "HIGH"
  ) {
    codeQuality -= 30;
  }

  if (
    qualityReport?.complexity ===
    "MEDIUM"
  ) {
    codeQuality -= 15;
  }

  // Architecture

  if (
    architecture?.confidence
  ) {
    architectureScore =
      parseInt(
        architecture.confidence
      );
  }

  // Docs

  if (
    !documentation?.features?.length
  ) {
    docs -= 30;
  }

  // Maintainability

  if (
    scanResult?.totalFiles > 1000
  ) {
    maintainability -= 10;
  }

  const finalScore =
    Math.round(

      (
        security +
        architectureScore +
        codeQuality +
        docs +
        maintainability
      ) / 5

    );

  let grade = "C";

  if (finalScore >= 95)
    grade = "A+";

  else if (finalScore >= 90)
    grade = "A";

  else if (finalScore >= 80)
    grade = "B";

  else if (finalScore >= 70)
    grade = "C";

  else
    grade = "D";

  return {

    healthScore:
      finalScore,

    grade,

    security,

    architecture:
      architectureScore,

    codeQuality,

    documentation:
      docs,

    maintainability

  };
}

module.exports =
repositoryHealthAnalyzer;