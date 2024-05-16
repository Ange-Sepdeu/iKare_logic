import express from 'express'
import { runCaptcha} from '../controllers/recaptcha.controller.js';

const router = express.Router()

router.route("/recaptcha").post(runCaptcha);


export default router;