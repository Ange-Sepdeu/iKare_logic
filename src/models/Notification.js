import mongoose from "mongoose";
const { Schema } = mongoose;

const ReadSchema = new Schema([{
    By: { type: Schema.Types.ObjectId, require: true },
    At: { type: Date, require: true },

}], { _id: false })

const NotificationSchema = new Schema({
    sender: { type: Schema.Types.ObjectId, require: true },
    recipients: [{ type: String, require: true }],
    type: { type: String, require: true },
    subject: { type: String, require: true },
    body: { type: String, require: true },
    sentAt: { type: Date, require: true },
    Delivered:[{ type: [ReadSchema], require: true }],
    read: [{ type: [ReadSchema], require: true }],
    // createdAt: { type: Date, require: true },
    // updatedAt: { type: Date, require: true },
    data: Schema.Types.Mixed
})

const Notification = mongoose.model('Notification', NotificationSchema);
export default Notification;