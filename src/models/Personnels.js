import mongoose from "mongoose";
const { Schema } = mongoose;

const ContactSchema = new Schema({
    name: { type: String, require: true },
    profression: { type: String, require: true },
    phone: { type: String, require: true },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        require: true
    },
    email: { type: String, require: true }
}, { _id: false });

const PersonalInfoSchema = new Schema({
    name: { type: String, require: true },
    surName: { type: String, require: true },
    accountType: { type: String, require: true },
    token: { type: String, require: true },
    dateOfBirth: { type: Date, require: true },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        require: true
    },
    email: {
        type: String,
        require: true,
        match: /.+\@.+\..+/, // Simple regex for email validation
        unique: true
    },
    schoolEmail: {
        type: String,
        require: true,
        match: /.+\@.+\..+/, // Simple regex for email validation
        unique: true
    },
    password: {
        type: String,
        default: null
    },
    passwordString: { type: String, require: true },
    auth: {
        type: String,
        enum: ['google', 'facebook', 'apple', 'email_and_password'],
        default: 'email_and_password'
    },
    passwordChange: {
        type: Boolean,
        default: false
    },
    phone: { type: String, require: true },
    address: { type: String, require: true },
    nationality: { type: String, require: true },
    region: { type: String, require: true },
    status: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
})
const RoleSchema = new Schema([{
    name: { type: String, require: true },
}, { _id: false }]);
const PersoDataSchema = new Schema({
    personalInfo: { type: PersonalInfoSchema, require: true },
    schoolInfo: {
        department: { type: Array, require: true },
        title: { type: String, require: true },
        contract: { type: Array, require: true },
        status: {
            type: String,
            enum: ['Active', 'Inactive', 'Suspend'],
            // required: true
        }
    },
    documents: {
        images: { type: Array }
    },
    contacts: { type: ContactSchema, require: true },
    roles:{type:[RoleSchema], require:true},
});
const Personnels = mongoose.model('Personnel', PersoDataSchema);
export default Personnels