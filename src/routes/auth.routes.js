import express from 'express'
import { loginUser,forgotPassword,confirmAccount,resendOtpCode,resetPassword,changePassword } from '../controllers/auth.controller.js'
import { userExist } from '../middleware/userExist.js'

const router = express.Router()

router.route("/login").post(loginUser)
router.route("/forgot-password").post(userExist,forgotPassword)
router.route("/verify-account").post(userExist,confirmAccount)
router.route("/reset-password").post(userExist,resetPassword)
router.route("/change-password").post(userExist,changePassword)
router.route("/resend-code").post(userExist,resendOtpCode)


export default router