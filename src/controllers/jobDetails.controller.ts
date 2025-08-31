import { Request, Response } from "express";
import { jobProfile } from "../models/jobDetails";
import { json } from "stream/consumers";

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
     console.log("Incoming selectedId:", selectedId);
    return res
      .status(200)
      .json({ message: "fetched selected profile", selectedProfile });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Something went wrong" });
  }
};
