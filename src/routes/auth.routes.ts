import { Router } from "express";

import {
  userAuthLogin,
  userAuthSignUp,
  authForgotMail,
  verifyEmailToken,
  authPasswordReset,
  verifyMailToken,
} from "../controllers/userAuth.controller";
// import {authMiddleware} from "../middleware/auth.middleware";

const router = Router();
router.post("/login", userAuthLogin);
router.post("/signup", userAuthSignUp);
router.post("/forgotMail", authForgotMail);
router.post("/verifyToken", verifyEmailToken);
router.post("/forgotPasswordPage", authPasswordReset);
router.post("/verifyMailToken", verifyMailToken);

export default router;
