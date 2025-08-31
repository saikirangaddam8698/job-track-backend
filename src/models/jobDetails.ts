import { Schema, model } from "mongoose";

const JobSchema = new Schema(
  {
    role: { type: String, required: true },
    company: { type: String, required: true },
    experience: { type: String, required: true },
    mailId: { type: String, required: true },
    jobDescription: { type: String, required: true },
    location: { type: String, required: true },
    jobType: { type: String, required: true },
    aboutCompany: { type: String, required: true },
    skills: { type: String, required: true },
    Responsibilities: { type: String, required: false },
  },
  { timestamps: true }
);

export const jobProfile = model("jobProfile", JobSchema);
