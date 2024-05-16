import express from 'express'
import * as emailController from '../controllers/email.controller.js';
import { auth } from '../middleware/auth.js';


const router = express.Router()

router.route("/").post(auth,emailController.sendEmail);


export default router;