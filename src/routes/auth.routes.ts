import { Router } from "express";
import { upload } from "../middleware/upload";
import express from "express";

import {
  userAuthLogin,
  userAuthSignUp,
  authForgotMail,
  verifyEmailToken,
  authPasswordReset,
  verifyMailToken,
  authProfilePcitureUpdate,
} from "../controllers/userAuth.controller";
import {
  jobPostDetails,
  getJobProfile,
  getSelectedProfile,
  applyJob,
  getFilteredJobs,
  getUserJobCount,
} from "../controllers/jobDetails.controller";

import {
  getJobStatus,
  getAllJobProfileStatus,
  getApplicationCount,
  getApplicationProfiles,
  applicationStatusChange,
} from "../controllers/jobStatus.controller";
// import {authMiddleware} from "../middleware/auth.middleware";

import {
  InterviewStatus,
  VerifyInterviewStatus,
} from "../controllers/interview.controller";

import {
  getNotifications,
  getNotificationByAction,
  verifyNotifications,
} from "../controllers/notification.controller";

const router = Router();
router.post("/login", userAuthLogin);
router.post("/signUp", upload.single("profilePicture"), userAuthSignUp);
router.post("/forgotMail", authForgotMail);
router.post("/verifyToken", verifyEmailToken);
router.post("/forgotPasswordPage", authPasswordReset);
router.post("/verifyMailToken", verifyMailToken);
router.post("/postJobDetails", jobPostDetails);
router.get("/getJobProfile", getJobProfile);
router.get("/getSelectedProfile", getSelectedProfile);
router.post("/getJobStatus", getJobStatus);
router.post(
  "/applyJob",
  upload.fields([
    { name: "resume", maxCount: 1 },
    { name: "picture", maxCount: 1 },
  ]),
  applyJob
);

router.post("/getAllJobProfileStatus", getAllJobProfileStatus);
router.post("/getApplicationCount", getApplicationCount);
router.post("/getApplicationProfiles", getApplicationProfiles);
router.post("/applicationStatusChange", applicationStatusChange);
router.post("/VerifyInterviewStatus", VerifyInterviewStatus);
router.post("/InterviewStatus", InterviewStatus);
router.post("/getFilteredJobs", getFilteredJobs);
router.post("/getUserJobCount", getUserJobCount);
router.post("/getAllNotifications", getNotifications);
router.post("/getNotificationByAction", getNotificationByAction);
router.post("/verifyNotifications", verifyNotifications);

router.post(
  "/authProfilePcitureUpdate",
  upload.single("profilePicture"),
  authProfilePcitureUpdate
);

router.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (err instanceof Error && err.message.includes("Only")) {
      return res.status(400).json({ message: err.message });
    }

    if (err.message === "Invalid file field") {
      return res
        .status(400)
        .json({ message: "Invalid file field in upload request." });
    }

    return res
      .status(500)
      .json({ message: "File upload failed.", error: err.message });
  }
);

export default router;
