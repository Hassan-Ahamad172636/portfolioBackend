// models/Experience.js
import mongoose from "mongoose";

const experienceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    companyName: { type: String, required: true },
    role: { type: String, required: true },
    duration: { type: String },
    description: { type: String },
    technologies: [{ type: String }],
  },
  { timestamps: true }
);

const Experience = mongoose.model("Experience", experienceSchema);
export default Experience;
