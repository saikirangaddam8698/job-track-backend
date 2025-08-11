import { Request, Response } from "express";
import { userSignUp } from "../models/user.signUp";

export const signUpUser = async (req: Request, res: Response) => {

  try {
      let { Username, password, firstName, lastName, mobile, gender, age } = req.body;
    const existingUser = await userSignUp.findOne({ Username });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists!" });
    }

    const newUser = new userSignUp({ Username, password, firstName, lastName, gender, age, mobile });
    await newUser.save();

    return res.status(201).json({ 
      message: "User created successfully", 
      newUser 
    });

  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "User already exists!" });
    }
    return res.status(500).json({ error: "Server error" });
  }
};
