import { Schema, model } from "mongoose";

const useJobStatus = new Schema({
  mailID: String,
  user_Id: String,
  jobProfile_Id: String,
  lName: String,
  fName: String,
  mobileNumber: String,
  resumePath: String,
  picturePath: String,
  interviewDate: String,
  jobStatus: { type: String, default: "ApplyNow" },
});
export const applicationStatus = model("applicationStatus", useJobStatus);
