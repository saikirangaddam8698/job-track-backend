import { Schema, model } from "mongoose";

const useJobStatus = new Schema({
  mailID: String,
  user_Id: String,
  jobProfile_Id: String,
  lName: String,
  fName: String,
  mobileNumber: String,
  jobStatus: { type: String, default: "Not applied" },
});
export const applicationStatus = model("applicationStatus", useJobStatus);
