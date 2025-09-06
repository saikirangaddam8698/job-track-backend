import { Request, Response } from "express";
import { jobProfile } from "../models/jobDetails";
import { applicationStatus } from "../models/jobStatus";

export const jobPostDetails = async (req: Request, res: Response) => {
  try {
    let {
      role,
      company,
      experience,
      mailId,
      jobDescription,
      location,
      jobType,
      aboutCompany,
      skills,
      Responsibilities,
    } = req.body;
    function capitalizeWords(str: string) {
      if (!str) return "";
      return str
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }

    role = capitalizeWords(role);

    const newJob = new jobProfile({
      role,
      company,
      experience,
      mailId,
      jobDescription,
      location,
      jobType,
      aboutCompany,
      skills,
      Responsibilities,
    });
    await newJob.save();
    return res.status(200).json({ message: "job posted succesfully", newJob });
  } catch (err: any) {
    return res
      .status(500)
      .json({ error: err.message || "Something went wrong" });
  }
};

export const getJobProfile = async (req: Request, res: Response) => {
  try {
    const jobs = await jobProfile.find();
    return res.status(200).json({ message: "fetched jobs", jobs });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Something went wrong" });
  }
};

export const getSelectedProfile = async (req: Request, res: Response) => {
  try {
    let { selectedId } = req.query;

    const selectedProfile = await jobProfile.findById(selectedId);
    return res
      .status(200)
      .json({ message: "fetched selected profile", selectedProfile });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Something went wrong" });
  }
};

export const applyJob = async (req: Request, res: Response) => {
  try {
    let { jobProfile_Id, user_Id, userName, mobile, firstName, lastName } =
      req.body;
    const resumeFile = (req as any).file;
    const alreadyApplied = await applicationStatus.findOne({
      user_Id: user_Id,
      jobProfile_Id: jobProfile_Id,
    });
    if (alreadyApplied) {
      return res
        .status(400)
        .json({ message: "Already applied for this job", alreadyApplied });
    }

    const appStatus = new applicationStatus({
      mailID: userName,
      user_Id: user_Id,
      jobProfile_Id: jobProfile_Id,
      jobStatus: "Applied",
      resumePath: resumeFile?.path,
      mobileNumber: mobile,
      fName: firstName,
      lName: lastName,
    });

    await appStatus.save();
    return res
      .status(200)
      .json({ message: "Successfully applied for this job", appStatus });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
