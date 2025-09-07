// models/QA.js
import mongoose from "mongoose";

const qaSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    title: { type: String, required: true },
    type: { type: String, enum: ["manual", "automation"], required: true },
    toolsUsed: [{ type: String }],
    description: { type: String },
    reportLink: { type: String },
  },
  { timestamps: true }
);

const QA = mongoose.model("QA", qaSchema);
export default QA;
