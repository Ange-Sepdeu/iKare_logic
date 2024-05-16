import express from 'express'
const router = express.Router()
import { getAllEvents ,createEvent ,updateEvent ,deleteEvent ,uploadEventImage } from '../controllers/commingEvent.controller.js'

router.route('/getAllEvents').get(getAllEvents)
router.route('/createEvent').post(createEvent)
router.route('/updateEvent').put(updateEvent)
router.route('/deleteEvent').delete(deleteEvent)

router.route("/uploadEventImage").post(uploadEventImage)

export default router;