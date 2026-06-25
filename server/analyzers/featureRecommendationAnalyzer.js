async function
featureRecommendationAnalyzer(
project,
askAI
){

const prompt = `

You are a Senior Software Architect.

Analyze this project:

${JSON.stringify(project)}

Suggest:

1 Missing Features

2 Priority

3 Why Needed

4 Files To Modify

5 Estimated Effort

Return JSON.

`;

const response =
await askAI(prompt);

return response;

}

module.exports =
featureRecommendationAnalyzer;