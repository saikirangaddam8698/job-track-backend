"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyInterviewStatus = exports.InterviewStatus = void 0;
const jobStatus_1 = require("../models/jobStatus");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const InterviewStatus = async (req, res) => {
    const { token } = req.body;
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (typeof decoded !== "object" ||
            !decoded.jobProfileId ||
            !decoded.userId) {
            return res.status(400).json({ error: "Invalid token payload" });
        }
        const { mailID, jobProfileId, userId } = decoded;
        const userExist = await jobStatus_1.applicationStatus.findOne({
            user_Id: userId,
            jobProfile_Id: jobProfileId,
        });
        if (!userExist) {
            return res
                .status(404)
                .json({ error: "Applicant not applied to this job" });
        }
        userExist.interviewAttended = true;
        userExist.jobStatus = "InterviewAttended";
        await userExist.save();
        return res.status(200).json({
            message: "Interview attendance confirmed",
            userExist,
        });
    }
    catch (error) {
        return res.status(401).json({
            error: "token verification failed",
            details: error.message,
        });
    }
};
exports.InterviewStatus = InterviewStatus;
const VerifyInterviewStatus = async (req, res) => {
    let { token } = req.body;
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (typeof decoded !== "object" ||
            !decoded.jobProfileId ||
            !decoded.userId) {
            return res.status(400).json({ error: "Invalid token payload" });
        }
        const { mailID, jobProfileId, userId } = decoded;
        const userExist = await jobStatus_1.applicationStatus.findOne({
            user_Id: userId,
            jobProfile_Id: jobProfileId,
        });
        if (!userExist) {
            return res
                .status(404)
                .json({ error: "Applicant not applied to this job" });
        }
        if (userExist) {
            if (userExist.interviewAttended === true) {
                return res
                    .status(200)
                    .json({ message: "User already attended the interview", userExist });
            }
            else
                return res
                    .status(200)
                    .json({ message: "user not attended the interview", userExist });
        }
    }
    catch (error) {
        return res
            .status(401)
            .json({ error: "token verification failed", deatils: error.message });
    }
};
exports.VerifyInterviewStatus = VerifyInterviewStatus;
