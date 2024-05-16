import { createPerso,
    deletePerso,
    updatePerso,
    deletePersoById,
    getAllPerso,
    getPersoById,
    updatePersoPersonalInfo,
    updatePersoSchoolInfo,
    updatePersoDocuments,
    updatePersoContact,
    uploadPersoImage
} from '../controllers/personnel.controller.js';
import express from "express"
const router = express.Router()

router.route("/createPerso").post(createPerso)
router.route("/deletePerso").delete(deletePerso)
router.route("/updatePerso/:id").put(updatePerso)
router.route("/deletePersoById/:id").delete(deletePersoById)
router.route("/getAllPerso").get(getAllPerso)
router.route("/getPersoById/:id").get(getPersoById)
router.route("/updatePersoPersonalInfo/:id").put(updatePersoPersonalInfo)
router.route("/updatePersoSchoolInfo/:id").put(updatePersoSchoolInfo)
router.route("/updatePersoDocuments/:id").put(updatePersoDocuments)
router.route("/updatePersoContact/:id").put(updatePersoContact)
router.route("/:id/upload").post(uploadPersoImage);
export default router;