import { Request, Response } from "express";
import { notification } from "../models/notification";

export const getNotifications = async (req: Request, res: Response) => {
  try {
    let { receiver_user_id, role } = req.body;
    if (!receiver_user_id || !role) {
      return res.status(400).json({ error: "receiver_user_id is required" });
    }
    const notificationresult = await notification.find({
      receiver_user_id: receiver_user_id,
      role: role,
    });
    if (!notificationresult) {
      return res.status(404).json({ error: "No notifications." });
    } else {
      return res
        .status(200)
        .json({ message: "displaying all notifications", notificationresult });
    }
  } catch (error: any) {
    return res
      .status(401)
      .json({ error: "token verification failed", deatils: error.message });
  }
};

export const getNotificationByAction = async (req: Request, res: Response) => {
  try {
    let { triggeredBy, role, jobProfile_Id, type } = req.body;
    if (!triggeredBy || !role) {
      return res
        .status(400)
        .json({ error: "triggeredBy and jobprofile id's are required" });
    }
    const notificationresult = await notification.find({
      triggeredBy: triggeredBy,
      role: role,
      jobProfile_Id: jobProfile_Id,
      type: type,
    });
    if (notificationresult) {
      return res.status(404).json({ error: "Notification alraedy exist" });
    }

    const newNotification = new notification({
      
    });
    return res.status(200).json({ message: "job posted succesfully", newNotification });
  } catch (error: any) {
    return res
      .status(401)
      .json({ error: "token verification failed", deatils: error.message });
  }
};
