import {  createPaymentRequest, getAllPaymentRequest, getPaymentRequestNotValidated, validatePaymentRequest } from "../controllers/paymentRequest.controller.js";
import express from "express"
const router = express.Router()

router.route("/getPaymentRequestNotValidated").get(getPaymentRequestNotValidated)
router.route("/getAllPaymentRequest").get(getAllPaymentRequest)
router.route("/createPaymentRequest").post(createPaymentRequest)
router.route("/validatePaymentRequest").post(validatePaymentRequest)

export default router;
