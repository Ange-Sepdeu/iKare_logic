import { getAllConcourPublishedByYear, getConcourPublished } from "../controllers/concour.controller.js";
import express from "express"
const router = express.Router()

router.route("/getConcourPublished").get(getConcourPublished)
router.route("/getAllConcourPublishedByYear/:year").get(getAllConcourPublishedByYear)

export default router;