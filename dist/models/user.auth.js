"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userAuth = void 0;
const mongoose_1 = require("mongoose");
const userAuthSchema = new mongoose_1.Schema({
    userName: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    gender: { type: String, required: true },
    mobile: { type: Number, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    age: { type: Number, required: true },
    role: { type: String, enum: ["admin", "user"], default: "user" },
    isVerified: { type: Boolean },
    picture: { type: String, required: true },
});
exports.userAuth = (0, mongoose_1.model)("userAuth", userAuthSchema);
