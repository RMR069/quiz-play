const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const OpenAI = require("openai");

admin.initializeApp();

const db = admin.firestore();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.generateQuizQuestions = onRequest({ cors: true }, async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const {
      gameCode,
      sourceText,
      questionCount = 5,
      timePerQuestion = 10,
      difficultyMode = "mixed",
      ownerUid = null,
      ownerEmail = null,
      ownerName = null,
    } = req.body || {};

    if (!gameCode) {
      return res.status(400).json({ error: "Missing gameCode" });
    }

    if (!sourceText || !sourceText.trim()) {
      return res.status(400).json({ error: "Missing sourceText" });
    }

    const safeQuestionCount = Math.min(
      Math.max(Number(questionCount) || 5, 1),
      20
    );

    const safeTimePerQuestion = Math.min(
      Math.max(Number(timePerQuestion) || 10, 5),
      60
    );

    const prompt = `
You are a quiz generator.

Generate exactly ${safeQuestionCount} multiple-choice quiz questions from the provided study material.

Rules:
- Return valid JSON only
- No markdown
- Output must be an array
- Each item must contain:
  - question
  - choices (array of 4 strings)
  - correctAnswerIndex (number from 0 to 3)
  - difficulty ("easy" or "medium" or "hard")
  - explanation
- Avoid duplicate questions
- Keep wording clear for students
- Base the questions only on the provided text

Difficulty mode: ${difficultyMode}

Study material:
"""
${sourceText}
"""
`;

    const response = await client.responses.create({
      model: "gpt-5.4",
      input: prompt,
    });

    const rawText = response.output_text || "";

    let parsedQuestions;

    try {
      parsedQuestions = JSON.parse(rawText);
    } catch (parseError) {
      logger.error("Failed to parse AI response as JSON", {
        rawText,
        parseError: parseError.message,
      });

      return res.status(500).json({
        error: "AI returned invalid JSON",
        rawText,
      });
    }

    if (!Array.isArray(parsedQuestions)) {
      return res.status(500).json({
        error: "AI response is not an array",
      });
    }

    const normalizedQuestions = parsedQuestions.map((q, index) => ({
      id: `q-${index + 1}`,
      question: q.question || "",
      choices: Array.isArray(q.choices)
        ? q.choices.slice(0, 4)
        : ["A", "B", "C", "D"],
      correctAnswerIndex:
        typeof q.correctAnswerIndex === "number" ? q.correctAnswerIndex : 0,
      difficulty: q.difficulty || "medium",
      explanation: q.explanation || "",
    }));

    await db.collection("sessions").doc(gameCode).set(
      {
        gameCode,
        questionCount: safeQuestionCount,
        timePerQuestion: safeTimePerQuestion,
        questions: normalizedQuestions,
        status: "ready",
        sourceText,
        ownerUid,
        ownerEmail,
        ownerName,
        aiGenerated: true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return res.status(200).json({
      success: true,
      gameCode,
      questions: normalizedQuestions,
    });
  } catch (error) {
    logger.error("generateQuizQuestions error", error);

    return res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
});