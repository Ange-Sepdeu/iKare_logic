import Notification from "../models/Notification.js";


export const getNotificationByRole = async (req, res) => {
    let role = "DAAC_Admin"
    const notification = await Notification.find({ 'recipients': role });
    res.status(200).send(notification);
  };