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
    return res
      .status(200)
      .json({ message: "fetched jobs", total: jobs.length, jobs });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Something went wrong" });
  }
};

export const getFilteredJobs = async (req: Request, res: Response) => {
  try {
    let { userId } = req.body;
    const appliedCount = await applicationStatus.countDocuments({
      user_Id: userId,
      jobStatus: "Applied",
    });

    const interviewScheduledCount = await applicationStatus.countDocuments({
      user_Id: userId,
      jobStatus: "InterviewScheduled",
    });

    const interviewsTakenCount = await applicationStatus.countDocuments({
      user_Id: userId,
      jobStatus: "InterviewAttended",
    });

    const offerSentCount = await applicationStatus.countDocuments({
      user_Id: userId,
      jobStatus: "Selected",
    });

    const RejectedCount = await applicationStatus.countDocuments({
      user_Id: userId,
      jobStatus: "Rejected",
    });

    const offerRejectedCount = await applicationStatus.countDocuments({
      user_Id: userId,
      jobStatus: "offerRejected",
    });

    const offerAccpetedCount = await applicationStatus.countDocuments({
      user_Id: userId,
      jobStatus: "offerAccepted",
    });

    return res.status(200).json({
      message: "fetched filtered jobs",
      stats: {
        appliedCount: appliedCount,
        interviewScheduledCount: interviewScheduledCount,
        interviewsTakenCount: interviewsTakenCount,
        offerSentCount: offerSentCount,
        RejectedCount: RejectedCount,
        offerRejectedCount: offerRejectedCount,
        offerAccpetedCount: offerAccpetedCount,
      },
    });
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
    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    const resumeFile = files?.["resume"]?.[0];
    const pictureFile = files?.["picture"]?.[0];

    const alreadyApplied = await applicationStatus.findOne({
      user_Id: user_Id,
      jobProfile_Id: jobProfile_Id,
    });
    if (alreadyApplied) {
      return res
        .status(400)
        .json({ message: "Already applied for this job", alreadyApplied });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const appStatus = new applicationStatus({
      mailID: userName,
      user_Id: user_Id,
      jobProfile_Id: jobProfile_Id,
      jobStatus: "Applied",
      resumePath: resumeFile ? `/uploads/resume/${resumeFile.filename}` : null,
      picturePath: pictureFile
        ? `/uploads/picture/${pictureFile.filename}`
        : null,

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
