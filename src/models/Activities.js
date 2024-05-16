import mongoose from "mongoose";
const { Schema } = mongoose;

const Activity = new Schema({
    title: { type: String },
    summary: { type: Array },
    article: { type: String },
},{_id:false})


const ActivitiesSchema = new Schema({
    en:{type:Activity},
    fr:{type:Activity},
    images: { type: Array},
    approved:[{type:Object}],
    dateOfevent: { type: Date, required: true },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    publish:{type:Boolean ,default:false}
});

const Activities = mongoose.model('Activities', ActivitiesSchema); // Changed 'Settings' to 'Activities'
export default Activities;
