import { registrationMessage, getAllCandidates, addCandidateFiles, getAllCandidatesBySession, getAllConcourByYear, generateStudent, deleteSession, addSessionToCandidate} from '../controllers/candidate.controller.js'
import express from "express"
const router = express.Router()

router.route("/registrationMessage").post(registrationMessage)
// router.route("/generateSessions").get(generateSessions)
router.route("/generateStudent").get(generateStudent)
router.route("/deleteSession").get(deleteSession)
router.route("/addSessionToCandidate").get(addSessionToCandidate)
router.route("/getAllCandidates").get(getAllCandidates)
router.route("/getAllCandidatesBySession").get(getAllCandidatesBySession)
router.route("/getAllConcourByYear/:year").get(getAllConcourByYear)
router.route("/addCandidateFiles").post(addCandidateFiles)
// router.route("/PublishedSession").post(PublishedSession)

export default router;