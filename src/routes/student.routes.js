import { 
    createStudent,
    getStudent,
    updateStudent, 
    deleteStudent, 
    getStudents, 
    getStudentsByField, 
    registerStudent,
    verifyStudent,
    updateStudentPersonalInfo,
    updateStudentAcademicInfo,
    updateStudentDocuments,
    updateStudentContacts,
    updateStudentCAMark,
    updateStudentExamsMark,
    updateStudentResistMark,
    reSendVerificationCode,
    getStudentBymatricule,
    updateAccountType,
    rejectedAccount
} from '../controllers/student.controller.js';
import express from "express"
import { auth } from '../middleware/auth.js';
const router = express.Router()

router.route("/createStudent").post(auth,createStudent)
router.route("/reSendVerificationCode/:id").post(auth,reSendVerificationCode)
router.route("/registerStudent").post(registerStudent)
router.route("/verifyStudent").post(verifyStudent)
router.route("/getStudents").get(auth,getStudents)
router.route("/getStudent/:id").get(getStudent)
router.route("/getStudent/:matricule").get(getStudent)
router.route("/updateStudent/:id").put(updateStudent)
router.route("/deleteStudent/:id").delete(deleteStudent)
router.route("/getStudentsByField/:field").get(getStudentsByField)
router.route("/updateStudentPersonalInfo/:id").put(updateStudentPersonalInfo);
router.route("/updateStudentAcademicInfo/:id").put(updateStudentAcademicInfo);
router.route("/updateStudentDocuments/:id").put(updateStudentDocuments);
router.route("/updateStudentContacts/:id").put(updateStudentContacts);
router.route("/updateStudentCAMark/:id/:courseId").put(updateStudentCAMark);
router.route("/updateStudentExamsMark/:id/:courseId").put(updateStudentExamsMark);
router.route("/updateStudentResistMark/:id/:courseId").put(updateStudentResistMark);
router.route("/updateAccountType/:id").post(updateAccountType);
router.route("/rejectedAccount/:id").post(rejectedAccount);


export default router;