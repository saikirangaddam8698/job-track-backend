import { Schema , model  } from "mongoose";

const userLoginSchema =  new Schema({
    Username : {type:String, required: true},
    password : {type:String, required:true},
    role:{}
})

export const userLogin = model('userLogin', userLoginSchema);