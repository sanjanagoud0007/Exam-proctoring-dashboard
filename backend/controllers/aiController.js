import {
  parseRawQuestions,
  buildFallbackQuestions,
  extractJsonFromText,
} from "../utils/parseAiQuestions.js";

export const generateQuestions = async (req, res) => {
  try {
    const topic = String(req.body.topic || "").trim();
    const count = Math.max(1, Math.min(Number(req.body.count) || 5, 20));
    const difficulty = ["easy", "medium", "hard"].includes(req.body.difficulty)
      ? req.body.difficulty
      : "medium";

    if (!topic) {
      return res.status(400).json({ message: "Topic is required" });
    }

    const apiKey = process.env.OPENAI_API_KEY?.trim();

    if (apiKey) {
      try {
        const response = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: process.env.OPENAI_MODEL || "gpt-4o-mini",
              temperature: 0.7,
              response_format: { type: "json_object" },
              messages: [
                {
                  role: "system",
                  content:
                    "You generate multiple-choice exam questions. Reply with valid JSON only.",
                },
                {
                  role: "user",
                  content: `Generate exactly ${count} ${difficulty} multiple-choice questions about "${topic}".
Return JSON: { "questions": [ { "question": string, "options": [4 strings], "correctAnswer": string matching one option } ] }`,
                },
              ],
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          const errMsg =
            data?.error?.message ||
            `OpenAI API error (${response.status})`;
          console.warn("OpenAI API error:", errMsg);
        } else {
          const text = data.choices?.[0]?.message?.content || "";
          const parsed = extractJsonFromText(text);
          const questions = parseRawQuestions(parsed).slice(
            0,
            count
          );

          if (questions.length > 0) {
            return res.json({
              source: "openai",
              questions,
            });
          }
        }
      } catch (err) {
        console.warn("OpenAI request failed:", err.message);
      }
    }

    const questions = buildFallbackQuestions(topic, difficulty, count);

    return res.json({
      source: apiKey ? "fallback-openai-unavailable" : "fallback",
      message: apiKey
        ? "OpenAI unavailable — generated template questions instead"
        : "Set OPENAI_API_KEY for AI-generated questions — using templates",
      questions,
    });
  } catch (error) {
    console.error("generateQuestions:", error);
    res.status(500).json({ message: error.message || "Generation failed" });
  }
};
