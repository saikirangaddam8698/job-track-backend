import { Schema, model } from "mongoose";

const notificationSchema = new Schema(
  {
    receiver_user_id: {
      type: Schema.Types.ObjectId,
      ref: "userAuth",
      required: true,
    },

    triggeredBy: {
      type: Schema.Types.ObjectId,
      ref: "userAuth",
      required: true,
    },

    jobProfile_Id: {
      type: Schema.Types.ObjectId,
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
  },
  { timestamps: true }
);

notificationSchema.index({ user_Id: 1, createdAt: -1 });

export const notification = model("notification", notificationSchema);
