import { Request, response, Response } from "express";
import { jobProfile } from "../models/jobDetails";
import { applicationStatus } from "../models/jobStatus";

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
        jobStatus: alreadyApplied.jobStatus,
      });
    }
    return res.status(200).json({
      message: "Not applied for this job",
      jobStatus: "Apply Now",
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
        .json({ message: "required user_Id and jobProfile_Id[] as array" });
    }

    const jobsStatus = await applicationStatus.find({
      user_Id,
      jobProfile_Id: { $in: jobProfile_Id },
    });

    // Build a map with defaults
    const statusMap: Record<string, string> = {};
    jobProfile_Id.forEach((id: string) => {
      const app = jobsStatus.find((a) => a.jobProfile_Id?.toString() === id);
      statusMap[id] = app ? app.jobStatus : "Not Applied";
    });

    return res.status(200).json(statusMap);
  } catch (err: any) {
    console.error("error something went wrong", err.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getApplicationCount = async (req: Request, response: Response) => {
  try {
    let { jobProfile_Id } = req.body;
    
  } catch (err: any) {}
};
