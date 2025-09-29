import { Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();
import { userAuth } from "../models/user.auth";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { sendEmail } from "../utils/sendMails";

export const verifyMailToken = async (req: Request, res: Response) => {
  let { token } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    if (typeof decoded === "object" && "userName" in decoded) {
      let userName = (decoded as JwtPayload).userName;
      userName = userName.trim().toLowerCase();

      const userExist = await userAuth.findOne({ userName });
      if (!userExist) {
        return res.status(404).json({ error: "User not found" });
      }
      userExist.isVerified = true;
      await userExist.save();

      return res.status(200).json({ message: "Token valid", userName });
    }
  } catch (error: any) {
    return res
      .status(401)
      .json({ error: "token verification failed", deatils: error.message });
  }
};

export const userAuthSignUp = async (req: Request, res: Response) => {
  try {
    let { userName, password, firstName, lastName, mobile, gender, age } =
      req.body;

    userName = userName.trim().toLowerCase();
    const existingUser = await userAuth.findOne({ userName });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new userAuth({
      userName,
      password: hashedPassword,
      firstName,
      lastName,
      gender,
      age,
      mobile,
      role: "user",
      isVerified: false,
    });
    await newUser.save();

    const mailVerifyToken = jwt.sign(
      { userName: newUser.userName, role: newUser.role },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" }
    );

    const verifyLink = `http://localhost:5173/signUpMailVerificationPage?token=${mailVerifyToken}`;

    await sendEmail(
      newUser.userName,
      "Verify Your Email - App Tracker",
      `
        <p>Hello,</p>
        <p>Thank you for signing up. Please click the link below to verify your account:</p>
        <a href="${verifyLink}">Verify Email</a>
        <p>This link will expire in 15 minutes. If you did not sign up, please ignore this email.</p>
      `
    );

    return res
      .status(200)
      .json({ message: "Mail sent Succesfully to verify", newUser });
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "User already exists!" });
    }
    return res.status(500).json({ error: "Server error" });
  }
};

// login controller
export const userAuthLogin = async (req: Request, res: Response) => {
  let { userName, password } = req.body;
  userName = userName.trim().toLowerCase();
  try {
    const user = await userAuth.findOne({ userName });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.isVerified) {
      return res
        .status(403)
        .json({ message: "Please verify your email before logging in" });
    }

    const isPassWordMatch = await bcrypt.compare(password, user.password);
    if (!isPassWordMatch) {
      return res.status(401).json({ message: "Wrong password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "secretKey",
      { expiresIn: "1hr" }
    );

    res.status(200).json({ message: "Login successful", token, user });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// forgot mail authentication
export const authForgotMail = async (req: Request, res: Response) => {
  try {
    let { userName } = req.body;
    userName = userName.trim().toLowerCase();

    const isMailExist = await userAuth.findOne({ userName });
    if (!isMailExist) {
      return res.status(404).json({ message: "User Doesn't exist" });
    }

    const resetToken = jwt.sign(
      { userName: isMailExist.userName },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" }
    );

    const resetLink = `http://localhost:5173/forgotPasswordPage?token=${resetToken}`;

    await sendEmail(
      isMailExist.userName,
      "Reset your Login Password",
      `
        <p>Hello,</p>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>This link will expire in 15 minutes. If you did not request this, please ignore this email.</p>
      `
    );

    return res.status(200).json({ message: "Password reset email sent" });
  } catch (err: any) {
    res.status(500).json({ error: "server error", details: err.message });
  }
};

export const verifyEmailToken = async (req: Request, res: Response) => {
  let { token } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    if (typeof decoded === "object" && "userName" in decoded) {
      let userName = (decoded as JwtPayload).userName;
      userName = userName.trim().toLowerCase();

      return res.status(200).json({ message: "Token valid", userName });
    }
  } catch (error: any) {
    return res
      .status(401)
      .json({ error: "token verification failed", deatils: error.message });
  }
};

export const authPasswordReset = async (req: Request, res: Response) => {
  try {
    let { userName, password } = req.body;
    userName = userName.trim().toLowerCase();

    const updateUser = await userAuth.findOne({ userName });
    if (!updateUser) {
      return res.status(404).json({ message: "User not found" });
    }
    const hashNewPassword = await bcrypt.hash(password, 10);
    updateUser.password = hashNewPassword;
    await updateUser.save();
    return res.status(200).json({ message: "password updated.", updateUser });
  } catch (err) {
    return res.status(401).json({ error: "server error", err });
  }
};
