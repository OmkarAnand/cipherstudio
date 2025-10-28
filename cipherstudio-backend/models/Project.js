import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  code: { type: String, required: true },
});

const projectSchema = new mongoose.Schema(
  {
    projectId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    files: [fileSchema], // array of { filename, code }
  },
  { timestamps: true }
);

const Project = mongoose.model("Project", projectSchema);

export default Project;
