import { Router } from "express";
import { upload } from "../middleware/upload";

import {
  userAuthLogin,
  userAuthSignUp,
  authForgotMail,
  verifyEmailToken,
  authPasswordReset,
  verifyMailToken,
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
} from "../controllers/notification.controller";

const router = Router();
router.post("/login", userAuthLogin);
router.post("/signUp", userAuthSignUp);
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

export default router;
