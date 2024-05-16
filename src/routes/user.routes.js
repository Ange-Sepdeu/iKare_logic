import express from 'express'
import { getAllUsers,createUser,getUserById,updateUser,deleteUser } from '../controllers/user.controller.js';
import { auth } from '../middleware/auth.js';


const router = express.Router()

router.route("/").get(getAllUsers).post(createUser);
router.route("/:id").get(getUserById).patch(auth,updateUser).delete(auth,deleteUser);

export default router;