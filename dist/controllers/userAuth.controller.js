"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authProfilePcitureUpdate = exports.authPasswordReset = exports.verifyEmailToken = exports.authForgotMail = exports.userAuthLogin = exports.userAuthSignUp = exports.verifyMailToken = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const user_auth_1 = require("../models/user.auth");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sendMails_1 = require("../utils/sendMails");
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const verifyMailToken = async (req, res) => {
    let { token } = req.body;
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (typeof decoded === "object" && "userName" in decoded) {
            let userName = decoded.userName;
            userName = userName.trim().toLowerCase();
            const userExist = await user_auth_1.userAuth.findOne({ userName });
            if (!userExist) {
                return res.status(404).json({ error: "User not found" });
            }
            userExist.isVerified = true;
            await userExist.save();
            return res.status(200).json({ message: "Token valid", userName });
        }
    }
    catch (error) {
        return res
            .status(401)
            .json({ error: "token verification failed", deatils: error.message });
    }
};
exports.verifyMailToken = verifyMailToken;
const userAuthSignUp = async (req, res) => {
    try {
        let { userName, password, firstName, lastName, mobile, gender, age } = req.body;
        const file = req.file;
        userName = userName.trim().toLowerCase();
        const existingUser = await user_auth_1.userAuth.findOne({ userName });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists!" });
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const newUser = new user_auth_1.userAuth({
            userName,
            password: hashedPassword,
            firstName,
            lastName,
            gender,
            age,
            mobile,
            role: "user",
            isVerified: false,
            picture: file ? `/uploads/profilePicture/${file.filename}` : null,
        });
        await newUser.save();
        const mailVerifyToken = jsonwebtoken_1.default.sign({ userName: newUser.userName, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: "15m" });
        const verifyLink = `${FRONTEND_URL}/signUpMailVerificationPage?token=${mailVerifyToken}`;
        await (0, sendMails_1.sendEmail)(newUser.userName, "Verify Your Email - App Tracker", `
        <p>Hello,</p>
        <p>Thank you for signing up. Please click the link below to verify your account:</p>
        <a href="${verifyLink}">Verify Email</a>
        <p>This link will expire in 15 minutes. If you did not sign up, please ignore this email.</p>
      `);
        return res
            .status(200)
            .json({ message: "Mail sent Succesfully to verify", newUser });
    }
    catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: "User already exists!" });
        }
        return res.status(500).json({ error: err.meassage });
    }
};
exports.userAuthSignUp = userAuthSignUp;
// login controller
const userAuthLogin = async (req, res) => {
    let { userName, password } = req.body;
    userName = userName.trim().toLowerCase();
    try {
        const user = await user_auth_1.userAuth.findOne({ userName });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (!user.isVerified) {
            return res
                .status(403)
                .json({ message: "Please verify your email before logging in" });
        }
        const isPassWordMatch = await bcrypt_1.default.compare(password, user.password);
        if (!isPassWordMatch) {
            return res.status(401).json({ message: "Wrong password" });
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || "secretKey", { expiresIn: "2hr" });
        res.status(200).json({ message: "Login successful", token, user });
    }
    catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};
exports.userAuthLogin = userAuthLogin;
// forgot mail authentication
const authForgotMail = async (req, res) => {
    try {
        let { userName } = req.body;
        userName = userName.trim().toLowerCase();
        const isMailExist = await user_auth_1.userAuth.findOne({ userName });
        if (!isMailExist) {
            return res.status(404).json({ message: "User Doesn't exist" });
        }
        const resetToken = jsonwebtoken_1.default.sign({ userName: isMailExist.userName }, process.env.JWT_SECRET, { expiresIn: "15m" });
        const resetLink = `${FRONTEND_URL}/forgotPasswordPage?token=${resetToken}`;
        await (0, sendMails_1.sendEmail)(isMailExist.userName, "Reset your Login Password", `
        <p>Hello,</p>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>This link will expire in 15 minutes. If you did not request this, please ignore this email.</p>
      `);
        return res.status(200).json({ message: "Password reset email sent" });
    }
    catch (err) {
        res.status(500).json({ error: "server error", details: err.message });
    }
};
exports.authForgotMail = authForgotMail;
const verifyEmailToken = async (req, res) => {
    let { token } = req.body;
    try {
        console.log("Token received:", token);
        console.log("JWT_SECRET:", process.env.JWT_SECRET);
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        console.log("Decoded:", decoded);
        if (typeof decoded === "object" && "userName" in decoded) {
            let userName = decoded.userName;
            userName = userName.trim().toLowerCase();
            return res.status(200).json({ message: "Token valid", userName });
        }
    }
    catch (error) {
        console.error("Token verification failed:", error.message);
        return res
            .status(401)
            .json({ error: "token verification failed", deatils: error.message });
    }
};
exports.verifyEmailToken = verifyEmailToken;
const authPasswordReset = async (req, res) => {
    try {
        let { userName, password } = req.body;
        userName = userName.trim().toLowerCase();
        const updateUser = await user_auth_1.userAuth.findOne({ userName });
        if (!updateUser) {
            return res.status(404).json({ message: "User not found" });
        }
        const hashNewPassword = await bcrypt_1.default.hash(password, 10);
        updateUser.password = hashNewPassword;
        await updateUser.save();
        return res.status(200).json({ message: "password updated.", updateUser });
    }
    catch (err) {
        return res.status(401).json({ error: "server error", err });
    }
};
exports.authPasswordReset = authPasswordReset;
const authProfilePcitureUpdate = async (req, res) => {
    try {
        let { Id } = req.body;
        const file = req.file;
        if (!file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        const userExist = await user_auth_1.userAuth.findById(Id);
        if (!userExist) {
            return res.status(404).json({ message: "User not found" });
        }
        userExist.picture = `/uploads/profilePicture/${file.filename}`;
        await userExist.save();
        return res
            .status(200)
            .json({ message: "profile picture updated.", userExist });
    }
    catch (err) {
        return res.status(401).json({ error: "server error", err });
    }
};
exports.authProfilePcitureUpdate = authProfilePcitureUpdate;
