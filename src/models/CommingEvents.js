import mongoose from "mongoose";
const Schema = mongoose.Schema

const commingEvents = new Schema({
    en:{type:String},
    fr:{ type:String},
    file:[{type:String}],
    dateOfEvent:{type:String},
    createdAt:{type:Date ,default:Date.now()}
})

const CommingEvents = mongoose.model('commingEvents' ,commingEvents);

export default CommingEvents