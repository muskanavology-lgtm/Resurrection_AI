const OpenAI = require("openai");
console.log("KEY =", process.env.OPENROUTER_API_KEY);
const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

async function askAI(prompt) {
  try {
    const response = await client.chat.completions.create({
      model: "meta-llama/llama-3.1-8b-instruct",
     messages: [
  {
    role: "system",
    content: `
You are an expert software architect + senior developer mentor.

You MUST:
- Explain code like onboarding a new developer
- Show file-by-file flow
- Identify backend/frontend/database parts
- Detect bugs or missing links
- Suggest improvements
- Explain step-by-step execution flow

Be VERY structured and simple.
`,
  },
  {
    role: "user",
    content: prompt,
  },
     ],
      temperature: 0.2,

    });

    return response.choices?.[0]?.message?.content || "No response";
  } catch (err) {
    console.error("AI ERROR:", err.message);
    return "AI service failed. Please check API key or model.";
  }
}

module.exports = askAI;