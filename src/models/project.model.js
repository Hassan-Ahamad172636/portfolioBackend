// models/Project.js
import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    title: { type: String, required: true },
    description: { type: String },
    techStack: [{ type: String }],
    githubLink: { type: String },
    liveLink: { type: String },
    images: [{ type: String }],
    status: { type: String, enum: ["active", "archived"], default: "active" },
  },
  { timestamps: true }
);

const Project = mongoose.model("Project", projectSchema);
export default Project;
