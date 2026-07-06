function healthScoreAnalyzer(project) {
  let security = 100;
  let architecture = 100;
  let maintainability = 100;
  let documentation = 100;
  if (
    project.securityReport &&
    project.securityReport.high > 0
  ) {
    security -=
      project.securityReport.high * 3;
  }
  if (
    project.routes.length < 3
  ) {
    architecture -= 20;
  }
  if (
    project.scanResult.controllers.length === 0
  ) {
    maintainability -= 20;
  }
  if (
    !project.documentation
  ) {
    documentation -= 30;
  }
  const overall = Math.round(
    (
      security +
      architecture +
      maintainability +
      documentation
    ) / 4
  );
  let grade = "C";
  if (overall >= 90) grade = "A+";
  else if (overall >= 80) grade = "A";
  else if (overall >= 70) grade = "B";
  return {
    overall,
    security,
    architecture,
    maintainability,
    documentation,
    grade
  };
}
module.exports = healthScoreAnalyzer;