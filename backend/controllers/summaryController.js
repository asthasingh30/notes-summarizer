import OpenAI from "openai";
import Summary from "../models/Summary.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MAX_INPUT_LENGTH = 20000; // guard against absurdly large pastes

// @route POST /api/summarise
export const createSummary = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Paste some notes or text to summarise first" });
    }

    if (text.length > MAX_INPUT_LENGTH) {
      return res.status(400).json({
        message: `That's a bit long (${text.length} chars). Please keep pastes under ${MAX_INPUT_LENGTH} characters.`,
      });
    }

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.startsWith("sk-replace")) {
      return res.status(500).json({
        message: "OPENAI_API_KEY is not configured on the server. Add it to backend/.env",
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a study assistant. Summarise the student's notes or textbook paragraph into a clear, concise summary that captures the key concepts, definitions, and any important facts. Use short paragraphs or bullet points where helpful. Do not add information that isn't in the original text.",
        },
        { role: "user", content: text },
      ],
      temperature: 0.4,
      max_tokens: 500,
    });

    const summaryText = completion.choices[0]?.message?.content?.trim();

    if (!summaryText) {
      return res.status(502).json({ message: "The AI didn't return a summary. Please try again." });
    }

    const savedSummary = await Summary.create({
      userId: req.user._id,
      originalText: text,
      summary: summaryText,
    });

    return res.status(201).json(savedSummary);
  } catch (err) {
    console.error("Summarise error:", err);

    if (err.status === 401) {
      return res.status(500).json({ message: "OpenAI rejected the API key. Check OPENAI_API_KEY in backend/.env" });
    }
    if (err.status === 429) {
      return res.status(429).json({ message: "Rate limit or quota exceeded on the OpenAI account. Try again shortly." });
    }

    return res.status(500).json({ message: "Something went wrong while generating the summary" });
  }
};

// @route GET /api/summaries
export const getSummaries = async (req, res) => {
  try {
    const summaries = await Summary.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json(summaries);
  } catch (err) {
    console.error("Get summaries error:", err);
    return res.status(500).json({ message: "Something went wrong while fetching your summaries" });
  }
};

// @route DELETE /api/summaries/:id
export const deleteSummary = async (req, res) => {
  try {
    const summary = await Summary.findOne({ _id: req.params.id, userId: req.user._id });

    if (!summary) {
      return res.status(404).json({ message: "Summary not found" });
    }

    await summary.deleteOne();
    return res.status(200).json({ message: "Summary deleted", id: req.params.id });
  } catch (err) {
    console.error("Delete summary error:", err);
    return res.status(500).json({ message: "Something went wrong while deleting the summary" });
  }
};
