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
} from "../controllers/jobDetails.controller";

import {
  getJobStatus,
  getAllJobProfileStatus,
  getApplicationCount,
  getApplicationProfiles,
} from "../controllers/jobStatus.controller";
// import {authMiddleware} from "../middleware/auth.middleware";

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
router.post("/applyJob", upload.single("resume"), applyJob);
router.post("/getAllJobProfileStatus", getAllJobProfileStatus);
router.post("/getApplicationCount", getApplicationCount);
router.post("/getApplicationProfiles", getApplicationProfiles);
export default router;
