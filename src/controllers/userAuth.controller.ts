import { Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();
import { userAuth } from "../models/user.auth";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);

export const verifyMailToken = async (req: Request, res: Response) => {
  let { token } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    if (typeof decoded === "object" && "Username" in decoded) {
      const Username = (decoded as JwtPayload).Username;

      const userExist = await userAuth.findOne({ Username });
      if (!userExist) {
        return res.status(404).json({ error: "User not found" });
      }
      userExist.isVerified = true;
      await userExist.save();

      return res.status(200).json({ message: "Token valid", Username });
    }
  } catch (error: any) {
    return res
      .status(401)
      .json({ error: "token verification failed", deatils: error.message });
  }
};

export const userAuthSignUp = async (req: Request, res: Response) => {
  try {
    let { Username, password, firstName, lastName, mobile, gender, age } =
      req.body;
    const existingUser = await userAuth.findOne({ Username });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new userAuth({
      Username,
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
      { Username: newUser.Username, role: newUser.role },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" }
    );

    const verifyLink = `http://localhost:5173/signUpMailVerificationPage?token=${mailVerifyToken}`;

    await resend.emails.send({
      from: "App Tracker <onboarding@resend.dev>",
      to: newUser.Username,
      subject: "Verify Your Email to Register",
      html: `
        <p>Hello,</p>
        <p>Please verify you email address to create your accout with us.</p>
        <a href="${verifyLink}">Verify Email address</a>
        <p>This link will expire in 1 hour. If you did not request this, please ignore this email.</p>
      `,
    });

    return res
      .status(200)
      .json({ message: "Mail sent Succesfully to verify", newUser });

    // return res.status(201).json({
    //   message: "User created successfully",
    //   newUser,
    // });
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "User already exists!" });
    }
    return res.status(500).json({ error: "Server error" });
  }
};

//login controller
export const userAuthLogin = async (req: Request, res: Response) => {
  const { Username, password } = req.body;
  try {
    const user = await userAuth.findOne({ Username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isPassWordMatch = await bcrypt.compare(password, user.password);
    if (!isPassWordMatch) {
      return res.status(401).json({ message: "Wrong password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "secretKey",
      { expiresIn: "15m" }
    );

    res.json({ message: "Login successful", user });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

//forgot mail authentication
export const authForgotMail = async (req: Request, res: Response) => {
  try {
    let { Username } = req.body;
    const isMailExist = await userAuth.findOne({ Username });
    if (!isMailExist) {
      return res.status(404).json({ message: "User Doesn't exist" });
    }

    const resetToken = jwt.sign(
      { Username: isMailExist.Username },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" }
    );

    const resetLink = `http://localhost:5173/forgotPasswordPage?token=${resetToken}`;

    await resend.emails.send({
      from: "App Tracker <onboarding@resend.dev>",
      to: isMailExist.Username,
      subject: "Reset your Login Password",
      html: `
        <p>Hello,</p>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>This link will expire in 15 minutes. If you did not request this, please ignore this email.</p>
      `,
    });

    return res.status(200).json({ message: "Password reset email sent" });
  } catch (err: any) {
    res.status(500).json({ error: "server error", details: err.message });
  }
};

export const verifyEmailToken = async (req: Request, res: Response) => {
  let { token } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    if (typeof decoded === "object" && "Username" in decoded) {
      const Username = (decoded as JwtPayload).Username;
      return res.status(200).json({ message: "Token valid", Username });
    }
  } catch (error: any) {
    return res
      .status(401)
      .json({ error: "token verification failed", deatils: error.message });
  }
};

export const authPasswordReset = async (req: Request, res: Response) => {
  try {
    let { Username, password } = req.body;
    const updateUser = await userAuth.findOne({ Username });
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
