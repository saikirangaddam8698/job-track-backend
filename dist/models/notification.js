"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notification = void 0;
const mongoose_1 = require("mongoose");
const notificationSchema = new mongoose_1.Schema({
    receiver_user_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "userAuth",
        required: true,
    },
    triggeredBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "userAuth",
        required: true,
    },
    jobProfile_Id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "jobProfile",
        required: false,
    },
    type: {
        type: String,
        enum: [
            "Applied",
            "Rejected",
            "InterviewScheduled",
            "Selected",
            "OfferSent",
            "InterviewAttended",
            "offerAccepted",
            "offerRejected",
            "allNotifications",
        ],
        default: "allNotifications",
    },
    message: {
        type: String,
        required: true,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    role: {
        type: String,
        enum: ["admin", "user"],
        required: true,
    },
    company: {
        type: String,
        required: false,
    },
    jobRoleName: {
        type: String,
        required: false,
    },
    lName: {
        type: String,
        required: false,
    },
    fName: {
        type: String,
        required: false,
    },
}, { timestamps: true });
notificationSchema.index({ user_Id: 1, createdAt: -1 });
exports.notification = (0, mongoose_1.model)("notification", notificationSchema);
