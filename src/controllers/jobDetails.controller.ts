import mongoose from "mongoose";
import { Request, Response } from "express";
import { jobProfile } from "../models/jobDetails";
import { applicationStatus } from "../models/jobStatus";
import { uploadFileToGCS } from "../middleware/upload";

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
      postedBy,
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
      postedBy: new mongoose.Types.ObjectId(postedBy),
    });
    await newJob.save();
    return res.status(200).json({ message: "job posted succesfully", newJob });
  } catch (err: any) {
    return res
      .status(500)
      .json({ error: err.message || "Something went wrong" });
  }
};

// export const getJobProfile = async (req: Request, res: Response) => {
//   try {
//     const userId = req.query.userId as string;
//     const action = req.query.action as string;
//     const search = (req.query.search as string) || "";
//     if (action === "admin") {
//       const jobs = await jobProfile
//         .find({ postedBy: userId })
//         .sort({ _id: -1 });
//       return res
//         .status(200)
//         .json({ message: "fetched jobs", total: jobs.length, jobs });
//     } else {
//       const jobs = await jobProfile.find().sort({ _id: -1 });
//       return res
//         .status(200)
//         .json({ message: "fetched jobs", total: jobs.length, jobs });
//     }
//   } catch (err: any) {
//     res.status(500).json({ error: err.message || "Something went wrong" });
//   }
// };

export const getJobProfile = async (req: Request, res: Response) => {
  try {
    const userid = req.query.userid as string;
    const action = req.query.action as string;
    const search = (req.query.search as string) || "";

    let filter: any = {};

    if (action === "admin") {
      filter.postedBy = userid;
    }

    if (search.trim() !== "") {
      filter.$or = [
        { role: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        {
          location: { $regex: search, $options: "i" },
        },
      ];
    }

    const jobs = await jobProfile.find(filter).sort({ _id: -1 });

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

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid userId" });
    }
    const objectUserId = new mongoose.Types.ObjectId(userId);

    const totalJobsPosted = await jobProfile.countDocuments({
      postedBy: objectUserId,
    });

    const jobsPosted = await jobProfile
      .find({ postedBy: objectUserId }, { _id: 1 })
      .lean();

    const jobIds = jobsPosted.map((job) => job._id);

    if (jobIds.length === 0) {
      return res.status(200).json({
        message: "No jobs found for this user",
        stats: {
          ApplyNow: 0,
          Applied: 0,
          InterviewScheduled: 0,
          InterviewAttended: 0,
          Selected: 0,
          Rejected: 0,
          offerRejected: 0,
          offerAccepted: 0,
        },
        totalApplications: 0,
        totalJobsPosted,
      });
    }

    const counts = await applicationStatus.aggregate([
      { $match: { jobProfile_Id: { $in: jobIds } } },
      { $group: { _id: "$jobStatus", count: { $sum: 1 } } },
    ]);

    const statuses = [
      "ApplyNow",
      "Applied",
      "InterviewScheduled",
      "InterviewAttended",
      "Selected",
      "Rejected",
      "offerRejected",
      "offerAccepted",
    ];

    const stats: Record<string, number> = {};
    let totalApplications = 0;

    statuses.forEach((status) => {
      const found = counts.find((c) => c._id === status);
      const count = found ? found.count : 0;
      stats[status] = count;
      totalApplications += count;
    });

    return res.status(200).json({
      message: "Fetched filtered jobs successfully",
      stats,
      totalApplications,
      totalJobsPosted,
    });
  } catch (err: any) {
    console.error(err);
    return res
      .status(500)
      .json({ error: err.message || "Something went wrong" });
  }
};

export const getUserJobCount = async (req: Request, res: Response) => {
  try {
    let { userId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    const objectUserId = new mongoose.Types.ObjectId(userId);

    const jobsApplied = await applicationStatus
      .find({ user_Id: objectUserId })
      .lean();

    if (!jobsApplied || jobsApplied.length === 0) {
      return res.status(200).json({
        message: "This user has not yet applied to any job",
        stats: {
          ApplyNow: 0,
          Applied: 0,
          InterviewScheduled: 0,
          InterviewAttended: 0,
          Selected: 0,
          Rejected: 0,
          offerRejected: 0,
          offerAccepted: 0,
        },
        totalApplications: 0,
      });
    }

    const counts = await applicationStatus.aggregate([
      { $match: { user_Id: objectUserId } },
      { $group: { _id: "$jobStatus", count: { $sum: 1 } } },
    ]);

    const statuses = [
      "ApplyNow",
      "Applied",
      "InterviewScheduled",
      "InterviewAttended",
      "Selected",
      "Rejected",
      "offerRejected",
      "offerAccepted",
    ];

    const stats: Record<string, number> = {};
    let totalApplications = 0;

    statuses.forEach((status) => {
      const found = counts.find((c) => c._id === status);
      const count = found ? found.count : 0;
      stats[status] = count;
      totalApplications += count;
    });

    return res.status(200).json({
      message: "Fetched user job application stats successfully",
      stats,
      totalApplications,
    });
  } catch (err: any) {
    console.error(err);
    return res
      .status(500)
      .json({ error: err.message || "Something went wrong" });
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
    let {
      jobProfile_Id,
      user_Id,
      userName,
      mobile,
      firstName,
      lastName,
      postedBy,
    } = req.body;

    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    const resumeFile = files?.["resume"]?.[0];
    const pictureFile = files?.["picture"]?.[0];

    const resumeUrl = resumeFile
      ? await uploadFileToGCS(resumeFile, "resume")
      : null;
    const pictureUrl = pictureFile
      ? await uploadFileToGCS(pictureFile, "picture")
      : null;

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
      resumePath: resumeUrl,
      picturePath: pictureUrl,
      mobileNumber: mobile,
      fName: firstName,
      lName: lastName,
      postedBy: postedBy,
    });

    await appStatus.save();
    return res
      .status(200)
      .json({ message: "Successfully applied for this job", appStatus });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
