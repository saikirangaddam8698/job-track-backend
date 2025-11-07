import { Request, Response } from "express";
import { applicationStatus } from "../models/jobStatus";

import jwt, { JwtPayload } from "jsonwebtoken";

export const InterviewStatus = async (req: Request, res: Response) => {
  const { token } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    if (
      typeof decoded !== "object" ||
      !decoded.jobProfileId ||
      !decoded.userId
    ) {
      return res.status(400).json({ error: "Invalid token payload" });
    }

    const { jobProfileId, userId } = decoded;

    const userExist = await applicationStatus.findOne({
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
  } catch (error: any) {
    return res.status(401).json({
      error: "token verification failed",
      details: error.message,
    });
  }
};

export const VerifyInterviewStatus = async (req: Request, res: Response) => {
  let { token } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    if (
      typeof decoded !== "object" ||
      !decoded.jobProfileId ||
      !decoded.userId
    ) {
      return res.status(400).json({ error: "Invalid token payload" });
    }

    const { jobProfileId, userId } = decoded;

    const userExist = await applicationStatus.findOne({
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
      } else
        return res
          .status(200)
          .json({ message: "user not attended the interview", userExist });
    }
  } catch (error: any) {
    return res
      .status(401)
      .json({ error: "token verification failed", deatils: error.message });
  }
};
