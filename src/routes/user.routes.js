import express from 'express'
import { getAllUsers,createUser,getUserById,updateUser,deleteUser, bookAppointment, updateAppointmentDetails, respondToAppointment, deleteAppointment, registerSuperAdmin } from '../controllers/user.controller.js';
import { auth } from '../middleware/auth.js';
import { deletePrescription, endConsultation, issuePrescription, responseToForm, sendFollowUpForm, startConsultation } from '../controllers/consultation.controller.js';
import { addEhr } from '../controllers/ehr.controller.js';

const router = express.Router()

router.route("/get-users").get(getAllUsers)
router.route("/add-super").post(registerSuperAdmin);
router.route("/register").post(createUser);
// router.route("/:id").get(getUserById).patch(auth,updateUser).delete(auth,deleteUser);
router.route("/get-singleuser").post(getUserById)
router.route("/update-delete").patch(updateUser).post(deleteUser);
router.route("/book-appointment").post(bookAppointment);
router.route("/update-appointment-details").put(updateAppointmentDetails);
router.route("/respond-to-appointment").post(respondToAppointment);
router.route("/delete-appointment").post(deleteAppointment);
router.route("/start-consultation").post(startConsultation);
router.route("/end-consultation").put(endConsultation);
router.route("/issue-prescription").post(issuePrescription);
router.route("/delete-prescription").post(deletePrescription)
router.route("/send-followup-form").post(sendFollowUpForm)
router.route("/response-to-form").post(responseToForm)
router.route("/submit-ehr").post(addEhr);

export default router;