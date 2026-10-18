
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "GEMINI_API_KEY is missing in Vercel"
    });
  }

  try {
    const { prompt, tool, style } = req.body || {};

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({
        error: "Please enter a prompt"
      });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are GPower AI, a helpful assistant.
Tool: ${tool || "study"}
Requested style: ${style || "Simple explanation"}
User request: ${prompt}
Answer clearly in the user's language.`
            }]
          }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "Gemini API request failed"
      });
    }

    const answer =
      data.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("") || "No answer was returned.";

    return res.status(200).json({ answer });
  } catch (error) {
    return res.status(500).json({
      error: "Could not connect to the AI service."
    });
  }
}
