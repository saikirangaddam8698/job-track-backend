import { Request, response, Response } from "express";
import { jobProfile } from "../models/jobDetails";
import { applicationStatus } from "../models/jobStatus";
import { error } from "console";
import { request } from "http";
import jwt, { JwtPayload } from "jsonwebtoken";
import { sendEmail } from "../utils/sendMails";

export const getJobStatus = async (req: Request, res: Response) => {
  try {
    let { user_Id, jobProfile_Id, token } = req.body;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        user_Id = decoded.userId;
        jobProfile_Id = decoded.jobProfileId;
      } catch (err: any) {
        return res.status(401).json({ error: "Invalid or expired token" });
      }
    }

    const alreadyApplied = await applicationStatus.findOne({
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
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllJobProfileStatus = async (req: Request, res: Response) => {
  try {
    let { user_Id, jobProfile_Id } = req.body;

    if (!user_Id || !Array.isArray(jobProfile_Id)) {
      return res
        .status(400)
        .json({ message: "required user_Id and jobProfile_Id as array" });
    }

    const jobsStatus = await applicationStatus.find({
      user_Id,
      jobProfile_Id: { $in: jobProfile_Id },
    });

    // Build a map with defaults
    const statusMap: Record<string, string> = {};
    jobProfile_Id.forEach((id: string) => {
      const app = jobsStatus.find((a) => a.jobProfile_Id?.toString() === id);
      statusMap[id] = app ? app.jobStatus : "ApplyNow";
    });

    return res.status(200).json(statusMap);
  } catch (err: any) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getApplicationCount = async (req: Request, response: Response) => {
  try {
    let { selectedId } = req.body;
    const Count = await applicationStatus.countDocuments({
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
  } catch (err: any) {
    return response.status(500).json({ "error:": err.meassage });
  }
};

export const getApplicationProfiles = async (
  req: Request,
  response: Response
) => {
  try {
    let { jobProfileId } = req.body;
    const appliedProfiles = await applicationStatus.find({
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
  } catch (err: any) {
    return response.status(500).json({ "error:": err.message });
  }
};

export const applicationStatusChange = async (req: Request, res: Response) => {
  try {
    let { jobProfileId, userId, action, interviewDate, token } = req.body;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        jobProfileId = decoded.jobProfileId;
        userId = decoded.userId;
      } catch (err: any) {
        return res.status(401).json({ error: "Invalid or expired token" });
      }
    }

    let update: any = {};

    if (action === "Rejected") {
      update.$set = { jobStatus: "Rejected" };
    } else if (action === "interviewScheduled") {
      update.$set = {
        jobStatus: "InterviewScheduled",
        interviewDate: new Date(interviewDate),
      };
    } else if (action === "Selected") {
      update.$set = { jobStatus: "Selected" };
    } else if (action === "interviewAttended") {
      update.$set = { jobStatus: "interviewAttended" };
    } else if (action === "acceptOffer") {
      update.$set = { jobStatus: "offerAccepted" };
    } else if (action === "offerRejected") {
      update.$set = { jobStatus: "offerRejected" };
    } else {
      return res.status(400).json({ message: "Invalid action type" });
    }

    const Application = await applicationStatus.findOneAndUpdate(
      { jobProfile_Id: jobProfileId, user_Id: userId },
      update,
      { new: true }
    );

    if (!Application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (action === "interviewScheduled") {
      const expireSeconds =
        Math.floor((new Date(interviewDate).getTime() - Date.now()) / 1000) +
        15 * 60;

      const resetToken = jwt.sign(
        { mailID: Application.mailID, jobProfileId, userId },
        process.env.JWT_SECRET!,
        { expiresIn: expireSeconds > 0 ? expireSeconds : "15m" }
      );

      const interviewLink = `http://localhost:5173/user/interviewScreen?token=${resetToken}`;

      await sendEmail(
        Application.mailID as string,
        "Interview Scheduled",
        `
          <p>Hello,</p>
          <p>Your interview is scheduled on <b>${new Date(
            interviewDate
          ).toLocaleString()}</b>.</p>
          <p>Click below to attend the interview (active only around the scheduled time):</p>
          <a href="${interviewLink}">Attend Interview</a>
          <p>This link will expire 15 minutes after the scheduled interview time.</p>
        `
      );
    }

    if (action === "Selected") {
      const resetToken = jwt.sign(
        { mailID: Application.mailID, jobProfileId, userId },
        process.env.JWT_SECRET!
      );

      const offerReceived = `http://localhost:5173/user/offerReceived?token=${resetToken}`;

      await sendEmail(
        Application.mailID as string,
        "Congratulations :)",
        `
        
     <p>Dear ${Application.fName} ${Application.lName},</p>

<p>Congratulations! We are excited to inform you that you have been 
<b>selected for the role of [Job Title]</b> at <b>[Company Name]</b>.</p>

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

<p>Warm regards, Thank you.</p>
        `
      );
    }

    return res.status(200).json({
      message: `Status changed to ${Application.jobStatus}`,
      Application,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
