/**
 * Normalize AI / OpenAI output into exam question objects.
 */
export const parseRawQuestions = (raw) => {
  let list = raw;

  if (raw && !Array.isArray(raw)) {
    if (Array.isArray(raw.questions)) list = raw.questions;
    else if (Array.isArray(raw.data)) list = raw.data;
  }

  if (!Array.isArray(list)) {
    return [];
  }

  return list
    .map((q, i) => {
      const options = Array.isArray(q.options)
        ? q.options.map(String).filter(Boolean)
        : [];

      const filledOptions =
        options.length >= 2
          ? options
          : ["Option A", "Option B", "Option C", "Option D"];

      let correct = String(q.correctAnswer || q.answer || "").trim();
      if (!correct || !filledOptions.includes(correct)) {
        correct = filledOptions[0];
      }

      return {
        question: String(q.question || q.text || `Question ${i + 1}`).trim(),
        type: "mcq",
        options: filledOptions.slice(0, 6),
        correctAnswer: correct,
      };
    })
    .filter((q) => q.question.length > 0);
};

export const normalizeQuestions = (raw, topic, difficulty, count) => {
  const normalized = parseRawQuestions(raw);
  if (normalized.length === 0) {
    return buildFallbackQuestions(topic, difficulty, count);
  }
  return normalized.slice(0, Math.min(count, 20));
};

export const buildFallbackQuestions = (topic, difficulty, count) => {
  const n = Math.max(1, Math.min(Number(count) || 5, 20));
  const templates = [
    {
      q: `What is a fundamental concept in ${topic}?`,
      opts: [
        "Core principle of the topic",
        "Unrelated hardware term",
        "Deprecated legacy pattern",
        "Random unrelated answer",
      ],
      correct: "Core principle of the topic",
    },
    {
      q: `Which practice is recommended when working with ${topic}?`,
      opts: [
        "Follow docs and test incrementally",
        "Skip all validation",
        "Disable error handling",
        "Avoid reading documentation",
      ],
      correct: "Follow docs and test incrementally",
    },
    {
      q: `What is a common mistake beginners make with ${topic}?`,
      opts: [
        "Ignoring edge cases",
        "Writing too many tests",
        "Using version control",
        "Reading official guides",
      ],
      correct: "Ignoring edge cases",
    },
    {
      q: `How does ${topic} relate to real-world software development?`,
      opts: [
        "It solves practical engineering problems",
        "It only applies to hardware",
        "It cannot be used in production",
        "It replaces all databases",
      ],
      correct: "It solves practical engineering problems",
    },
    {
      q: `(${difficulty}) Best tool or approach for ${topic}?`,
      opts: [
        "Industry-standard ecosystem tools",
        "No tools ever required",
        "Only manual pen-and-paper",
        "Avoiding all frameworks",
      ],
      correct: "Industry-standard ecosystem tools",
    },
  ];

  return Array.from({ length: n }, (_, i) => {
    const t = templates[i % templates.length];
    return {
      question: t.q,
      type: "mcq",
      options: t.opts,
      correctAnswer: t.correct,
    };
  });
};

export const extractJsonFromText = (text) => {
  if (!text || typeof text !== "string") return null;

  const cleaned = text.replace(/```json|```/gi, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    /* continue */
  }

  const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    try {
      return JSON.parse(arrayMatch[0]);
    } catch {
      /* continue */
    }
  }

  const objectMatch = cleaned.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    try {
      return JSON.parse(objectMatch[0]);
    } catch {
      /* continue */
    }
  }

  return null;
};
