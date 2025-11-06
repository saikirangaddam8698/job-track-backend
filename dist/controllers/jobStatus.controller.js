"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applicationStatusChange = exports.getApplicationProfiles = exports.getApplicationCount = exports.getAllJobProfileStatus = exports.getJobStatus = void 0;
const jobDetails_1 = require("../models/jobDetails");
const jobStatus_1 = require("../models/jobStatus");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sendMails_1 = require("../utils/sendMails");
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const getJobStatus = async (req, res) => {
    try {
        let { user_Id, jobProfile_Id, token } = req.body;
        if (token) {
            try {
                const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
                user_Id = decoded.userId;
                jobProfile_Id = decoded.jobProfileId;
            }
            catch (err) {
                return res.status(401).json({ error: "Invalid or expired token" });
            }
        }
        const alreadyApplied = await jobStatus_1.applicationStatus.findOne({
            user_Id: user_Id,
            jobProfile_Id: jobProfile_Id,
        });
        if (alreadyApplied) {
            return res.status(200).json({
                message: "Already applied for this job",
                alreadyApplied,
            });
        }
        return res.status(200).json({
            message: "Not applied for this job",
            jobStatus: "ApplyNow",
            alreadyApplied,
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getJobStatus = getJobStatus;
const getAllJobProfileStatus = async (req, res) => {
    try {
        let { user_Id, jobProfile_Id } = req.body;
        if (!user_Id || !Array.isArray(jobProfile_Id)) {
            return res
                .status(400)
                .json({ message: "required user_Id and jobProfile_Id as array" });
        }
        const jobsStatus = await jobStatus_1.applicationStatus.find({
            user_Id,
            jobProfile_Id: { $in: jobProfile_Id },
        });
        // Build a map with defaults
        const statusMap = {};
        jobProfile_Id.forEach((id) => {
            const app = jobsStatus.find((a) => a.jobProfile_Id?.toString() === id);
            statusMap[id] = app ? app.jobStatus : "ApplyNow";
        });
        return res.status(200).json(statusMap);
    }
    catch (err) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
exports.getAllJobProfileStatus = getAllJobProfileStatus;
const getApplicationCount = async (req, response) => {
    try {
        let { selectedId } = req.body;
        const Count = await jobStatus_1.applicationStatus.countDocuments({
            jobProfile_Id: selectedId,
            jobStatus: {
                $in: [
                    "Applied",
                    "Rejected",
                    "InterviewScheduled",
                    "Selected",
                    "OfferSent",
                    "InterviewAttended",
                    "offerAccepted",
                    "offerRejected",
                ],
            },
        });
        return response
            .status(200)
            .json({ meassage: "number of applications submitted", Count });
    }
    catch (err) {
        return response.status(500).json({ "error:": err.meassage });
    }
};
exports.getApplicationCount = getApplicationCount;
const getApplicationProfiles = async (req, response) => {
    try {
        let { jobProfileId } = req.body;
        const appliedProfiles = await jobStatus_1.applicationStatus.find({
            jobProfile_Id: jobProfileId,
            jobStatus: {
                $in: [
                    "Applied",
                    "Rejected",
                    "InterviewScheduled",
                    "InterviewAttended",
                    "Selected",
                    "offerAccepted",
                    "offerRejected",
                ],
            },
        });
        return response
            .status(200)
            .json({ meassage: "applied profiles", appliedProfiles });
    }
    catch (err) {
        return response.status(500).json({ "error:": err.message });
    }
};
exports.getApplicationProfiles = getApplicationProfiles;
const applicationStatusChange = async (req, res) => {
    try {
        let { jobProfileId, userId, action, interviewDate, token } = req.body;
        if (token) {
            try {
                const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
                jobProfileId = decoded.jobProfileId;
                userId = decoded.userId;
            }
            catch (err) {
                return res.status(401).json({ error: "Invalid or expired token" });
            }
        }
        const jobDetails = await jobDetails_1.jobProfile.findById(jobProfileId);
        let update = {};
        if (action === "Rejected") {
            update.$set = { jobStatus: "Rejected" };
        }
        else if (action === "interviewScheduled") {
            update.$set = {
                jobStatus: "InterviewScheduled",
                interviewDate: new Date(interviewDate),
            };
        }
        else if (action === "Selected") {
            update.$set = { jobStatus: "Selected" };
        }
        else if (action === "interviewAttended") {
            update.$set = { jobStatus: "interviewAttended" };
        }
        else if (action === "acceptOffer") {
            update.$set = { jobStatus: "offerAccepted" };
        }
        else if (action === "offerRejected") {
            update.$set = { jobStatus: "offerRejected" };
        }
        else {
            return res.status(400).json({ message: "Invalid action type" });
        }
        const Application = await jobStatus_1.applicationStatus.findOneAndUpdate({ jobProfile_Id: jobProfileId, user_Id: userId }, update, { new: true });
        if (!Application) {
            return res.status(404).json({ message: "Application not found" });
        }
        if (action === "interviewScheduled") {
            const expireSeconds = Math.floor((new Date(interviewDate).getTime() - Date.now()) / 1000) +
                15 * 60;
            const resetToken = jsonwebtoken_1.default.sign({ mailID: Application.mailID, jobProfileId, userId }, process.env.JWT_SECRET, { expiresIn: expireSeconds > 0 ? expireSeconds : "15m" });
            const interviewLink = `${FRONTEND_URL}/user/interviewScreen?token=${resetToken}`;
            await (0, sendMails_1.sendEmail)(Application.mailID, "Interview Scheduled", `
    <p>Dear Candidate,</p>
    <p>
      We are pleased to inform you that your application for the role of 
      <strong>${jobDetails?.role}</strong> at 
      <strong>${jobDetails?.company}</strong> has been shortlisted.
    </p>
    <p>
      Your interview has been scheduled for 
      <b>${new Date(interviewDate).toLocaleString()}</b>.
    </p>
    <p>
      Please click the link below to join the interview (the link will be active only 
      around the scheduled time):
    </p>
    <p>
      <a href="${interviewLink}" style="color: #1a73e8; text-decoration: none; font-weight: bold;">
        Attend Interview
      </a>
    </p>
    <p>
      <small>This link will expire 15 minutes after the scheduled interview time.</small>
    </p>
    <br/>
    <p>Best regards,<br/>HR Team – ${jobDetails?.company}</p>
  `);
        }
        if (action === "Selected") {
            const resetToken = jsonwebtoken_1.default.sign({ mailID: Application.mailID, jobProfileId, userId }, process.env.JWT_SECRET);
            const offerReceived = `${FRONTEND_URL}/user/offerReceived?token=${resetToken}`;
            await (0, sendMails_1.sendEmail)(Application.mailID, "Congratulations :)", `
        
     <p>Dear ${Application.fName} ${Application.lName},</p>

<p>Congratulations! We are excited to inform you that you have been 
<b>selected for the role of <strong>${jobDetails?.role}</strong> at <b> ${jobDetails?.company}</b>.</p>

<p>We truly appreciate the time and effort you put into the interview process. 
As the next step, please review your <b>official offer letter</b> using the link below:</p>

<p>
  <a href="${offerReceived}" 
     style="background:#007bff;color:#fff;padding:10px 15px;text-decoration:none;border-radius:5px;">
     View Your Offer Letter
  </a>
</p>

<p><b>Important:</b>  
- This link is valid for 48 hours only.  
- It can be accessed only once.  
- Please do not share it with anyone.</p>

<p>We look forward to welcoming you onboard and starting this exciting journey together!</p>

 <p>Warm regards,<br/>HR Team – ${jobDetails?.company}</p>
        `);
        }
        return res.status(200).json({
            message: `Status changed to ${Application.jobStatus}`,
            Application,
        });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
exports.applicationStatusChange = applicationStatusChange;
