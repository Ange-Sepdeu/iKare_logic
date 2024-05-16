import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";
import * as userService from '../services/user.service.js'
import { SENDMAIL } from "../utils/sendmail.js";
import { generateString,mailMessages } from "../utils/helper.js";
import { getOneToken,createToken } from "../services/token.service.js";
import { config } from "../config/app.config.js";


export const loginUser= async (req,res)=>{
    let user = null
    if(req.body.auth){
        if(req.body.auth.toLowerCase()==='google' || req.body.auth.toLowerCase()==='facebook'
        || req.body.auth.toLowerCase()==='apple'){
        
            if(!req.body.authToken) return res.status(400).json({ error: 'No user found with these credentials' });
            
            user = await userService.getUserByAuthToken(req.body?.authToken)
            if(!user) return res.status(400).json({ error: 'No user found with these credentials' });
            

            //generate jwt
        }else if(req.body.auth.toLowerCase()==='email_and_password'){
            user = await userService.getUserByEmail(req.body.email)
            if(!user) return res.status(400).json({ error: 'No user found with these credentials' });
            
            if(user){
                if(!user.verified)
                    return res.status(403).json({ error: "Sorry this email is not verified" });
                //check if user password is same ia db hashed password
                const isPasswordValid = await bcrypt.compare(req.body.password, user.password)
                if(!isPasswordValid) return res.status(400).json({ error: 'No user found with these credentials' });
            }
        }
    }else{
        return res.status(400).json({ error: 'Please enter auth type' });
    }

    const token = jwt.sign({ user },process.env.JWT_TOKEN_KEY,
        {
          expiresIn: config.JWT_EXPIRE_TIME,
        }
      );
    
     //removing password from user object
      const { password, ...responseUser } = user._doc;

      return res.status(200).json({ data: {
        responseUser,token
      },status:'success',message:'User Login successfull' });
}

export const forgotPassword = async (req,res)=>{
    const { email } = req.body;
    const user = await userService.getUserByEmail(email)
    if(!user.verified)
        return res.status(403).json({ error: "Sorry this user email is not  verified" });
    
    let token = ''
    let isTokenExist = true
    do{
        token = generateString()
        const result = await getOneToken({token})
        if(!result) 
            isTokenExist = false

    }while(isTokenExist)

    const isSave = await createToken({token,email})
    if(isSave){
        const msg = {
            to:email,
            subject: "Instant Job",
            content: mailMessages('forgot-password',token),
            html: true
        }

        SENDMAIL(msg,(info)=>{
            if(info.messageId){
                return res.status(200).json({data: {token}, status:'success',message:`Token Send to ${email} successfully !!!` });
            }else{
                return res.status(500).json({ error: 'An error occured while sending OTP' });
            }
        })
    }else{
        return res.status(500).json({ error: 'An error occured while saving token' });
    }
}

export const resetPassword = async (req,res)=>{
    const {email,password} = req.body
    let user = await userService.getUserByEmail(email)
    
    if(!user.verified)
        return res.status(403).json({ error: "Sorry this user email is not  verified" });

    //hashing the passwords
    const saltRounds = 10
    const salt = await bcrypt.genSalt(saltRounds)
    const hash = await bcrypt.hash(password, salt)

    user = await userService.updateUser(user.id,{password: hash})
    if(user){
        return res.status(200).json({status:'success',message:"Password changes successfully !!! " });
    }else{
        return res.status(500).json({ error: 'An error occured while updating password' });
    }
}


export const changePassword = async (req,res)=>{
    const {email,oldPassword,newPassword} = req.body
    let user = await userService.getUserByEmail(email)
    
    if(!user.verified)
        return res.status(403).json({ error: "Sorry this user email is not  verified" });

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password)
    if(!isPasswordValid) return res.status(400).json({ error: 'Incorrect Password Try again' });

    //hashing the passwords
    const saltRounds = 10
    const salt = await bcrypt.genSalt(saltRounds)
    const hash = await bcrypt.hash(newPassword, salt)

    user = await userService.updateUser(user.id,{password: hash})
    if(user){
        return res.status(200).json({status:'success',message:"Password Updated successfully !!! " });
    }else{
        return res.status(500).json({ error: 'An error occured while updating password' });
    }
}


export const confirmAccount= async(req,res)=>{
    const { token,email } = req.body
    const result = await getOneToken({token})
    if(!result || result.email!=email)  return res.status(500).json({ error: 'Invalid OTP code' });
    
    let user = await userService.getUserByEmail(email)
    user = await userService.updateUser(user.id,{verified: true})

    if(user)  return res.status(200).json({status:'success',message:"Email Confirmed " });

    return res.status(500).json({ error: 'An error occured while trying to confrim account try again' });
}

export const resendOtpCode = async (req,res)=>{
    const { email } = req.body
    let token = ''
    let isTokenExist = true
    do{
        token = generateString()
        const result = await getOneToken({token})
        if(!result) 
            isTokenExist = false

    }while(isTokenExist)

    const isSave = await createToken({token,email})
    if(isSave){
        const msg = {
            to:email,
            subject: "Instant Job",
            content: mailMessages('create-account',token),
            html: true
        }

        SENDMAIL(msg,(info)=>{
            if(info.messageId){
                return res.status(200).json({data: {token}, status:'success',message:`Token Send to ${email} successfully !!!` });
            }else{
                return res.status(500).json({ error: 'An error occured while sending OTP' });
            }
        })
    }else{
        return res.status(500).json({ error: "Sorry couldn't send OTP" });
    }

}