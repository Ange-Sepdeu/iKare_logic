import{
    registerCandidate,
    verifyCandidate,
    createCandidate,
    login,
    addCandidateFiles,
    reSendVerificationCode,
    validCandidate,
    logout
} from '../controllers/auths.controller.js';
import express from "express"
const router = express.Router()

/* start cadidate Registration */
router.route("/registerCandidate").post(registerCandidate)
router.route("/reSendVerificationCode").post(reSendVerificationCode)
router.route("/verifyCandidate").post(verifyCandidate)
router.route("/login").post(login)
router.route("/logout").post(logout)
router.route("/createCandidate").post(createCandidate)
router.route("/validCandidate").post(validCandidate)
router.route("/addCandidateFiles").post(addCandidateFiles)

/* end candidate Registration */


export default router;