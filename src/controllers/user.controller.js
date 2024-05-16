import bcrypt from "bcrypt";
import * as userService from "../services/user.service.js";
import { generateString, mailMessages } from "../utils/helper.js";
import { getOneToken,createToken } from "../services/token.service.js";
import { SENDMAIL } from "../utils/sendmail.js";
import * as roleService from "../services/role.service.js"
import userSchema from "../models/user.model.js";


export const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json({ data: users, status: "success", message: 'Fetch users successfully !!!' }).status(200);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createUser = async (req, res) => {
  try {

    // if (!req.body.firstname || !req.body.lastname || !req.body.auth) {
    //   return res.status(400).json({ err: 'Wrong body informations check body sent' })
    // }

    if (req.body.email) {
      const isUserFound = await userService.getUserByEmail(req.body.email)
      if (isUserFound) return res.status(400).json({ err: "Sorry user with this email exist already" })
    }
    console.log(req.body);
    exit
    res.json(req.body);
    // if (req.body.auth.toLowerCase() === 'google' || req.body.auth.toLowerCase() === 'facebook'
    //   || req.body.auth.toLowerCase() === 'apple') {

    //   if (!req.body.authToken) {
    //     return res.status(400).json({ err: "Sorry can't signup with social media with AuthToken" })
    //   }
    // } else if (req.body.auth.toLowerCase() === 'email_and_password') {
    //   if (!req.body.password || !req.body.email) {
    //     return res.status(400).json({ err: "Sorry can't signup without email and password" })
    //   }

    //   // hashing users password
    //   const saltRounds = 10
    //   const salt = await bcrypt.genSalt(saltRounds)
    //   const hash = await bcrypt.hash(req.body.password, salt)
    //   req.body.password = hash
    // }

    if (req.body.auth.toLowerCase() != 'email_and_password')
        req.body.verified = true

    const user = await userService.createUser(req.body);
    console.log('creates user')

    if (req.body.auth.toLowerCase() === 'email_and_password') {

      if(req.body.roles){
        const role = await roleService.getRole(req.body.roles);
        if(role){
          const user = await userService.createUser(req.body);

          let token = ''
      
          token = generateString()
          const hashedOTP = await bcrypt.hash(token, saltRound);
          const saveToken = await createToken({ 

                   token: hashedOTP,
                   email: email,
                   createdAt: Date.now(),
                   expiresAt: Date.now() + 3600000, })
          
          if (saveToken) {
            const msg = {
              to: req.body.email,
              subject: "IAI-SMS",
              content: mailMessages('create-account',token,user.firstname),
              html: true
            }

            SENDMAIL(msg, (info) => {
              if (info.messageId) {
                console.log("Mail sent: ",info.messageId)
                
              }
            })
          }  

          console.log('creates user')
        }else{
          return res.status(500).json({ error: err.message });
        }
      }

      let token = ''
      
        token = generateString()
        const hashedOTP = await bcrypt.hash(token, saltRound);
      const saveToken = await createToken({ 

               token: hashedOTP,
               email: email,
               createdAt: Date.now(),
               expiresAt: Date.now() + 3600000, })
      
      if (saveToken) {
        const msg = {
          to: req.body.email,
          subject: "IAI-SMS",
          content: mailMessages('create-account',token,user.firstname),
          html: true
        }

        SENDMAIL(msg, (info) => {
          if (info.messageId) {
            console.log("Mail sent: ",info.messageId)
            
          }
        })
      }
    }

    return res.json({ data: user, status: "success", message: 'User created successfully' }).status(201);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (user !== null) return res.json({ data: user, status: "success", message: 'User found !!!' }).status(200);

    return res.json({ data: user, status: "success", message: `No user found with id: ${id}` }).status(401);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    let user = await userService.updateUser(req.params.id, req.body);
    if (user !== null) {
      user = await userService.getUserById(req.params.id)
    }
    res.json({ data: user, status: "success" }).status(200);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await userService.deleteUser(req.params.id);
    res.json({ data: user, status: "success" }).status(200);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};