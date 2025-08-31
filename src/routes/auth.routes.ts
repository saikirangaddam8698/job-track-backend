import { Router } from "express";

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
} from "../controllers/jobDetails.controller";
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

export default router;
