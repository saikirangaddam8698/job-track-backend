import { Request, Response } from "express";
// import {userLogin} from "../models/user.login";
import { userSignUp } from "../models/user.signUp";
export const loginUser = async (req: Request, res:Response) => {
const {Username, password} =  req.body;
try {
    const user = await userSignUp.findOne({Username});
    if(!user){
        console.log("no user found");
              return res.status(404).json({ message: 'User not found' });
    }
    if(user.password !== password){
        console.log("password didnt matched");
      return res.status(401).json({ message: 'Wrong password' });
    }

    res.json({ message: 'Login successful', user });
}catch(err){
        res.status(500).json({ error: 'Server error' });

}
}