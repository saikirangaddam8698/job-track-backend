"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobProfile = void 0;
const mongoose_1 = require("mongoose");
const JobSchema = new mongoose_1.Schema({
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
    postedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "userAuth",
        required: true,
    },
}, { timestamps: true });
exports.jobProfile = (0, mongoose_1.model)("jobProfile", JobSchema);
