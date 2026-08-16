import mongoose from "mongoose";

const summarySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    originalText: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      required: true,
    },
  },
  { timestamps: true } // gives us createdAt automatically
);

const Summary = mongoose.model("Summary", summarySchema);
export default Summary;
