import mongoose from "mongoose";
const Schema = mongoose.Schema;
 
const FCCertificateSchema = new Schema({
    name: String,
    surName: String,
    tel:String,
    gender: {
        type: String,
        enum: ['M','F']
    },
    email: String,
    region: String,
    center: String,
    dob: Date,
    startDate:Date,
    endDate: Date,
    modules: Array,
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

export default mongoose.model("FCCertificates", FCCertificateSchema);