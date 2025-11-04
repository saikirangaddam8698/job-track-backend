"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_1 = require("../middleware/upload");
const userAuth_controller_1 = require("../controllers/userAuth.controller");
const jobDetails_controller_1 = require("../controllers/jobDetails.controller");
const jobStatus_controller_1 = require("../controllers/jobStatus.controller");
// import {authMiddleware} from "../middleware/auth.middleware";
const interview_controller_1 = require("../controllers/interview.controller");
const notification_controller_1 = require("../controllers/notification.controller");
const router = (0, express_1.Router)();
router.post("/login", userAuth_controller_1.userAuthLogin);
router.post("/signUp", upload_1.upload.single("profilePicture"), userAuth_controller_1.userAuthSignUp);
router.post("/forgotMail", userAuth_controller_1.authForgotMail);
router.post("/verifyToken", userAuth_controller_1.verifyEmailToken);
router.post("/forgotPasswordPage", userAuth_controller_1.authPasswordReset);
router.post("/verifyMailToken", userAuth_controller_1.verifyMailToken);
router.post("/postJobDetails", jobDetails_controller_1.jobPostDetails);
router.get("/getJobProfile", jobDetails_controller_1.getJobProfile);
router.get("/getSelectedProfile", jobDetails_controller_1.getSelectedProfile);
router.post("/getJobStatus", jobStatus_controller_1.getJobStatus);
router.post("/applyJob", upload_1.upload.fields([
    { name: "resume", maxCount: 1 },
    { name: "picture", maxCount: 1 },
]), jobDetails_controller_1.applyJob);
router.post("/getAllJobProfileStatus", jobStatus_controller_1.getAllJobProfileStatus);
router.post("/getApplicationCount", jobStatus_controller_1.getApplicationCount);
router.post("/getApplicationProfiles", jobStatus_controller_1.getApplicationProfiles);
router.post("/applicationStatusChange", jobStatus_controller_1.applicationStatusChange);
router.post("/VerifyInterviewStatus", interview_controller_1.VerifyInterviewStatus);
router.post("/InterviewStatus", interview_controller_1.InterviewStatus);
router.post("/getFilteredJobs", jobDetails_controller_1.getFilteredJobs);
router.post("/getUserJobCount", jobDetails_controller_1.getUserJobCount);
router.post("/getAllNotifications", notification_controller_1.getNotifications);
router.post("/getNotificationByAction", notification_controller_1.getNotificationByAction);
router.post("/verifyNotifications", notification_controller_1.verifyNotifications);
router.post("/authProfilePcitureUpdate", upload_1.upload.single("profilePicture"), userAuth_controller_1.authProfilePcitureUpdate);
router.use((err, req, res, next) => {
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
});
exports.default = router;
