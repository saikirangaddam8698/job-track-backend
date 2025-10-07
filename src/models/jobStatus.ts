import { Schema, model } from "mongoose";

const useJobStatus = new Schema(
  {
    mailID: String,
    user_Id: { type: Schema.Types.ObjectId, ref: "userAuth", required: true },
    jobProfile_Id: {
      type: Schema.Types.ObjectId,
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
  },
  { timestamps: true }
);
export const applicationStatus = model("applicationStatus", useJobStatus);
