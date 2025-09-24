import { Request, response, Response } from "express";
import { jobProfile } from "../models/jobDetails";
import { applicationStatus } from "../models/jobStatus";
import { error } from "console";
import { request } from "http";

export const getJobStatus = async (req: Request, res: Response) => {
  try {
    const { user_Id, jobProfile_Id } = req.body;
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
          "Selected",
          "OfferSent",
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
    let { jobProfileId, userId, action, interviewDate } = req.body;

    let update: any = {};

    if (action === "rejected") {
      update.$set = { jobStatus: "Rejected" };
    } else if (action === "interviewScheduled") {
      update.$set = {
        jobStatus: "InterviewScheduled",
        interviewDate: new Date(interviewDate),
      };
    } else if (action === "interviewCracked") {
      update.$set = { jobStatus: "Selected" };
    } else if (action === "sendOffer") {
      update.$set = { jobStatus: "OfferSent" };
    } else {
      return res.status(400).json({ message: "Invalid action type" });
    }

    const Application = await applicationStatus.findOneAndUpdate(
      {
        jobProfile_Id: jobProfileId,
        user_Id: userId,
      },
      update,
      { new: true }
    );

    if (!Application) {
      return res.status(404).json({ message: "Application not found" });
    }

    return res.status(200).json({
      message:
        action === "rejected"
          ? "Profile Rejected"
          : "Interview Scheduled successfully",
      Application,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
