// models/Skill.js
import mongoose from "mongoose";

const skillSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: { type: String, required: true },
    level: { type: String, enum: ["beginner", "intermediate", "expert"] },
    category: { type: String }, // frontend / backend / qa
    icon: { type: String },
  },
  { timestamps: true }
);

const Skill = mongoose.model("Skill", skillSchema);
export default Skill;
