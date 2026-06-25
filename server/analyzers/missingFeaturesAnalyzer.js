function missingFeaturesAnalyzer(
  analysis,
  routes,
  scanResult
) {

  const detected = [];
  const missing = [];

  const routeText =
    JSON.stringify(routes)
      .toLowerCase();

  // Authentication

  if (
    routeText.includes("login") ||
    routeText.includes("auth")
  ) {
    detected.push(
      "Authentication"
    );
  } else {
    missing.push(
      "Authentication"
    );
  }

  // Email Verification

  if (
    routeText.includes(
      "verify-email"
    )
  ) {
    detected.push(
      "Email Verification"
    );
  } else {
    missing.push(
      "Email Verification"
    );
  }

  // Refresh Token

  if (
    routeText.includes(
      "refresh-token"
    )
  ) {
    detected.push(
      "Refresh Token"
    );
  } else {
    missing.push(
      "Refresh Token"
    );
  }

  // Rate Limiter

  missing.push(
    "Rate Limiting"
  );

  // Swagger

  missing.push(
    "Swagger Documentation"
  );

  // Audit Logs

  missing.push(
    "Audit Logs"
  );

  // Caching

  missing.push(
    "Caching"
  );

  // Error Handling

  missing.push(
    "Centralized Error Handling"
  );

  return {

    detected,

    missing,

    projectGrade:
      missing.length < 3
      ? "A"
      : missing.length < 6
      ? "B"
      : "C"

  };

}

module.exports =
missingFeaturesAnalyzer;