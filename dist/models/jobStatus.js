"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applicationStatus = void 0;
const mongoose_1 = require("mongoose");
const useJobStatus = new mongoose_1.Schema({
    mailID: String,
    user_Id: { type: mongoose_1.Schema.Types.ObjectId, ref: "userAuth", required: true },
    jobProfile_Id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "jobProfile",
        required: true,
    },
    lName: String,
    fName: String,
    mobileNumber: String,
    resumePath: String,
    picturePath: String,
    interviewDate: String,
    interviewAttended: { type: Boolean, default: false },
    jobStatus: { type: String, default: "ApplyNow" },
    postedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "userAuth",
        required: false,
    },
}, { timestamps: true });
exports.applicationStatus = (0, mongoose_1.model)("applicationStatus", useJobStatus);
