

import { GoogleGenAI } from "@google/genai";
import Summary from "../models/Summary.js";

const MAX_INPUT_LENGTH = 20000;

// @route POST /api/summarise
export const createSummary = async (req, res) => {
  try {
    // Initialize Gemini when a request arrives
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        message: "Paste some notes or text to summarise first",
      });
    }

    if (text.length > MAX_INPUT_LENGTH) {
      return res.status(400).json({
        message: `That's a bit long (${text.length} chars). Please keep pastes under ${MAX_INPUT_LENGTH} characters.`,
      });
    }

    if (
      !process.env.GEMINI_API_KEY ||
      process.env.GEMINI_API_KEY.startsWith("your_")
    ) {
      return res.status(500).json({
        message: "GEMINI_API_KEY is not configured. Add it to backend/.env",
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are a study assistant. Summarise the student's notes or textbook paragraph into a clear, concise summary that captures key concepts, definitions, and important facts. Use short paragraphs or bullet points where helpful. Do not add information that isn't in the original text.

Here are the notes:

${text}`,
      config: {
        temperature: 0.4,
        maxOutputTokens: 500,
      },
    });

    const summaryText = response.text?.trim();

    if (!summaryText) {
      return res.status(502).json({
        message: "The AI didn't return a summary. Please try again.",
      });
    }

    const savedSummary = await Summary.create({
      userId: req.user._id,
      originalText: text,
      summary: summaryText,
    });

    return res.status(201).json(savedSummary);

  } catch (err) {
    console.error("Gemini summarise error:", err);

    if (err.status === 401 || err.status === 403) {
      return res.status(500).json({
        message: "Gemini rejected the API key. Check GEMINI_API_KEY in backend/.env",
      });
    }

    if (err.status === 429) {
      return res.status(429).json({
        message: "Gemini rate limit or quota exceeded. Please try again shortly.",
      });
    }

    return res.status(500).json({
      message: "Something went wrong while generating the summary",
    });
  }
};

// @route GET /api/summaries
export const getSummaries = async (req, res) => {
  try {
    const summaries = await Summary.find({
      userId: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json(summaries);

  } catch (err) {
    console.error("Get summaries error:", err);

    return res.status(500).json({
      message: "Something went wrong while fetching your summaries",
    });
  }
};

// @route DELETE /api/summaries/:id
export const deleteSummary = async (req, res) => {
  try {
    const summary = await Summary.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!summary) {
      return res.status(404).json({
        message: "Summary not found",
      });
    }

    await summary.deleteOne();

    return res.status(200).json({
      message: "Summary deleted",
      id: req.params.id,
    });

  } catch (err) {
    console.error("Delete summary error:", err);

    return res.status(500).json({
      message: "Something went wrong while deleting the summary",
    });
  }
};
