

import Groq from "groq-sdk";
import Summary from "../models/Summary.js";

const MAX_INPUT_LENGTH = 20000;

// @route POST /api/summarise
export const createSummary = async (req, res) => {
  try {
    const { text } = req.body;

    // Validate input
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

    // Check API key
    if (
      !process.env.GROQ_API_KEY ||
      process.env.GROQ_API_KEY.startsWith("your_")
    ) {
      return res.status(500).json({
        message: "GROQ_API_KEY is not configured. Add it to backend/.env",
      });
    }

    // Initialize Groq
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    // Generate summary using Groq
    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful study assistant. Summarise students' notes into clear, concise summaries. Capture key concepts, definitions, and important facts. Use headings and bullet points where helpful. Do not add information that isn't in the original text.",
        },
        {
          role: "user",
          content: `Summarise these study notes:\n\n${text}`,
        },
      ],
      temperature: 0.4,
      max_tokens: 500,
    });

    const summaryText =
      completion.choices[0]?.message?.content?.trim();

    if (!summaryText) {
      return res.status(502).json({
        message: "The AI didn't return a summary. Please try again.",
      });
    }

    // Save summary in MongoDB
    const savedSummary = await Summary.create({
      userId: req.user._id,
      originalText: text,
      summary: summaryText,
    });

    return res.status(201).json(savedSummary);

  } catch (err) {
    console.error("Groq summarise error:", err);

    if (err.status === 401 || err.status === 403) {
      return res.status(500).json({
        message: "Groq rejected the API key. Check GROQ_API_KEY in backend/.env",
      });
    }

    if (err.status === 429) {
      return res.status(429).json({
        message: "Groq rate limit or quota exceeded. Please try again shortly.",
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