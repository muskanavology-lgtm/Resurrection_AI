const axios = require("axios");

async function askGemini(prompt) {
  const response = await axios.post(
    process.env.GEMINI_URL,
    {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ]
    },
    {
      headers: {
        "Content-Type": "application/json"
      }
    }
  );

  return response.data;
}

module.exports = askGemini;