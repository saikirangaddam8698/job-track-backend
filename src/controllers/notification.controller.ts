import { Request, Response } from "express";
import { notification } from "../models/notification";
import { jobProfile } from "../models/jobDetails";
import { applicationStatus } from "../models/jobStatus";

export const getNotifications = async (req: Request, res: Response) => {
  try {
    let { receiver_user_id, isRead } = req.body;
    if (!receiver_user_id) {
      return res.status(400).json({ error: "receiver_user_id is required" });
    }
    // const notificationresult = await notification.find({
    //   receiver_user_id: receiver_user_id,
    //   isRead: isRead || false || true,
    // });

    const notificationresult = await notification
      .find({
        receiver_user_id,
        ...(typeof isRead !== "undefined" && { isRead }),
      })
      .sort({ createdAt: -1 });
    if (notificationresult.length === 0) {
      return res
        .status(200)
        .json({ message: "no new notifications", notificationresult });
    }
    if (notificationresult.length > 0) {
      return res
        .status(200)
        .json({ message: "displaying all notifications", notificationresult });
    }
  } catch (error: any) {
    return res
      .status(404)
      .json({ error: "token verification failed", deatils: error.message });
  }
};

// export const getNotificationByAction = async (req: Request, res: Response) => {

//   try {
//     let { triggeredBy, role, jobProfile_Id, type, message } = req.body;
//     if (!triggeredBy || !role || !type) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }
//     const job = await jobProfile.findById(jobProfile_Id);
//     if (!job) {
//       return res.status(404).json({ error: "Job not found" });
//     } else {
//       const jobApplication = await applicationStatus.find({
//         jobProfile_Id: jobProfile_Id,
//         user_Id: triggeredBy,
//       });
//       const notificationresult = await notification.find({
//         triggeredBy: triggeredBy,
//         role: role,
//         jobProfile_Id: jobProfile_Id,
//         type: type,
//         receiver_user_id: job.postedBy,
//       });
//       if (notificationresult.length > 0) {
//         return res.status(404).json({ error: "Notification alraedy exist" });
//       }

//       const newNotification = new notification({
//         triggeredBy: triggeredBy,
//         role: role,
//         jobProfile_Id: jobProfile_Id,
//         type: type,
//         receiver_user_id: job.postedBy,
//         message: message,
//         company: job.company,
//         jobRoleName: job.role,
//         lName: jobApplication[0]?.lName,
//         fName: jobApplication[0]?.fName,
//       });
//       await newNotification.save();
//       return res
//         .status(200)
//         .json({ message: "Received a new notification", newNotification });
//     }
//   } catch (error: any) {
//     return res
//       .status(401)
//       .json({ error: "something went wrong", deatils: error.message });
//   }
// };

export const getNotificationByAction = async (req: Request, res: Response) => {
  try {
    let { triggeredBy, receiver_user_id, role, jobProfile_Id, type, message } =
      req.body;

    if (!triggeredBy || !role || !type || !jobProfile_Id) {
      return res
        .status(400)
        .json({ error: "Missing required fields in request body" });
    }

    // --- Fetch the related job ---
    const job = await jobProfile.findById(jobProfile_Id);
    if (!job) return res.status(404).json({ error: "Job not found" });

    let finalReceiverId;

    // --- Direction of notification based on type ---
    if (["Applied", "offerAccepted", "offerRejected"].includes(type)) {
      finalReceiverId = job.postedBy;
    } else if (
      ["Rejected", "InterviewScheduled", "Selected", "OfferSent"].includes(type)
    ) {
      if (!receiver_user_id) {
        return res.status(400).json({
          error:
            "receiver_user_id is required for admin-triggered actions (Rejected, InterviewScheduled, etc.)",
        });
      }
      finalReceiverId = receiver_user_id;
    } else {
      return res
        .status(400)
        .json({ error: `Unsupported notification type: ${type}` });
    }

    // --- Prevent duplicate notifications ---
    const existingNotification = await notification.findOne({
      triggeredBy,
      receiver_user_id: finalReceiverId,
      jobProfile_Id,
      type,
    });

    if (existingNotification) {
      return res.status(409).json({ error: "Notification already exists" });
    }

    // --- Get applicant details (for name info) ---
    const jobApplication = await applicationStatus.findOne({
      jobProfile_Id,
      user_Id: role === "user" ? triggeredBy : finalReceiverId,
    });

    // --- Create new notification ---
    const newNotification = new notification({
      triggeredBy,
      receiver_user_id: finalReceiverId,
      jobProfile_Id,
      type,
      message,
      role,
      company: job.company,
      jobRoleName: job.role,
      fName: jobApplication?.fName,
      lName: jobApplication?.lName,
    });

    await newNotification.save();

    return res.status(200).json({
      message: "✅ Notification created successfully",
      newNotification,
    });
  } catch (error: any) {
    console.error("Error in getNotificationByAction:", error.message);
    return res
      .status(500)
      .json({ error: "Something went wrong", details: error.message });
  }
};

export const verifyNotifications = async (req: Request, res: Response) => {
  try {
    let { notificationId } = req.body;
    if (!notificationId) {
      return res
        .status(400)
        .json({ error: "Id of the notification is required" });
    }

    const updatedNotification = await notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );

    if (!updatedNotification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    return res.status(200).json({
      message: "Notification marked as read",
      notification: updatedNotification,
    });
  } catch (error: any) {
    return res
      .status(401)
      .json({ error: "token verification failed", deatils: error.message });
  }
};
