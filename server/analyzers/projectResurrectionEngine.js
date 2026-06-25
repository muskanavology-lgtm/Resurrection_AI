
function projectResurrectionEngine({

analysis,
techStack,
scanResult,
routes,
databaseInfo,
securityReport,
qualityReport,
architecture,
repositoryHealth

}){

return {

readme: `
# Project Documentation

Framework:
${analysis.framework}

Frontend:
${techStack.frontend.join(", ")}

Backend:
${techStack.backend.join(", ")}

Database:
${techStack.database.join(", ")}

Total Files:
${scanResult.totalFiles}
`,

architectureGuide: `
Architecture:
${architecture.architecture}

Reason:
${architecture.reason}
`,

deploymentGuide: `
Deployment Steps

1 Install dependencies

npm install

2 Configure ENV

3 Setup Database

4 Run Project

npm start
`,

onboardingGuide: `
Developer Onboarding

1 Read README

2 Check Routes

3 Check Controllers

4 Check Models

5 Run Local Setup
`,

healthScore:
repositoryHealth.healthScore

};

}

module.exports =
projectResurrectionEngine;