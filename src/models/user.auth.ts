import { Schema, model } from "mongoose";

const userAuthSchema = new Schema({
  userName: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  gender: { type: String, required: true },
  mobile: { type: Number, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  age: { type: Number, required: true },
  role: { type: String, enum: ["admin", "user"], default: "user" },
  isVerified: { type: Boolean },
});

export const userAuth = model("userAuth", userAuthSchema);
