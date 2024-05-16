import mongoose from "mongoose";
const { Schema } = mongoose;


const ModifiedSchema = new Schema([{
    preMark: { type: Number, require: true },
    modMark: { type: Number, require: true },
    modifiedBy: { type: String, require: true },
    modifiedOn: { type: Date, require: true },

}], { _id: false });
const subjectMarkschema = new Schema({
    currentMark: { type: Number, require: true, default: 0 },
    modified: { type: [ModifiedSchema], require: true, default: [] }
}, { _id: false });
const SessionSchema = new Schema({
    sessionName: { type: String, require: true },
    field: [{ type: String, require: true }],
    level: { type: Array, require: true },
    dateOfConcour: { type: Date, require: true },
    center: [{ type: String, require: true }],
    passed: { type: Boolean, require: true, default: false },
    totalAmount: { type: Number, require: true },
    beginRegistration: { type: Date, require: true },
    endRegistration: { type: Date, require: true },
    concourRequirements: [{ type: String, require: true }],
    status: { type: Boolean, require: true },
    published: { type: Boolean, require: true },
    publishedDate: { type: Date, require: true },
    submitted: { type: Boolean, require: true },
    passedMark: { type: Number, require: true },
    subject: [{
        moduleName: { type: String, require: true },
        moduleCoeficient: { type: Number, require: true },
        moduleTotalMark: { type: Number, require: true },
        status: { type: Boolean, require: true },
        subjects: [{
            subjectName: { type: String, require: true },
            subjectCoeficient: { type: Number, require: true },
            subjectTotalMark: { type: Number, require: true },
            subjectStatus: { type: Boolean, require: true },
            subjectMark: { type: subjectMarkschema, require: true },
        }]
    }]

}, { _id: false });

const PaymentSchema = new Schema({
    amountPaid: { type: Number, require: true },
    paidDate: { type: Date, require: true },
    paymentMethod: { type: String, require: true },
    receivedBy: { type: String, require: true }
}, { _id: false });


const FieldsofStudySchema = new Schema({
    name: { type: String, require: true }
}, { _id: false });

const LevelSchema = new Schema({
    name: { type: String, require: true }
}, { _id: false });


const PositionSchema = new Schema({
    longitude: { type: String, require: true },
    latitude: { type: String, require: true },
}, { _id: false });


const CenterSchema = new Schema({
    centerName: { type: String, require: true, unique: true },
    centerHead: { type: String, require: true },
    Desc: { type: String, require: true },
    phone: [{ type: String, require: true }],
    email: [{ type: String, require: true }],
    position: { type: [PositionSchema], require: true },
    centerImage: [{ type: String, require: true }],
}, { _id: true });

const ConcourSubjectSchema = new Schema({
    subjectName: { type: String, require: true },
    subjectCoeficient: { type: Number, require: true },
    subjectTotalMark: { type: Number, require: true },
    subjectStatus: { type: Boolean, require: true, default: true },
    subjectMark: { type: subjectMarkschema, require: true },
}, { _id: false })
const ConcourModuleSchema = new Schema({
    moduleName: { type: String, require: true },
    moduleCoeficient: { type: Number, require: true },
    moduleTotalMark: { type: Number, require: true },
    subjects: { type: [ConcourSubjectSchema], require: true },
    status: { type: Boolean, require: true, default: true },
}, { _id: false })
const ConcourRequirementsSchema = new Schema({
    name: { type: String, require: true },
    status: { type: Boolean, require: true, default: true },
}, { _id: false });

const PermissionsSchema = new Schema({
    name: { type: String, require: true, unique: true },
    status: { type: Boolean, require: true, default: true },
}, { _id: false });

const RoleSchema = new Schema([{
    name: { type: String, require: true },
    permissions: Schema.Types.Mixed,
    settings: Schema.Types.Mixed,
    status: { type: Boolean, require: true, default: false },
}, { _id: false }]);

const PaymentRequestTypeSchema = new Schema([{
    type: { type: String, require: true },
    kind: { type: String, require: true },
    year: { type: String, require: true },
    amount: { type: Number, require: true },
    penality: { type: Number, require: true },
    duration: { type: Number, require: true },
    beginPenality: { type: Date, require: true }
}, { _id: false }])

const RRCitationsSchema = new Schema({
    en: { type: String, require: true },
    fr: { type: String, require: true },
}, { _id: false })
const CitationSchema = new Schema({
    RRCitations: [RRCitationsSchema],
    RRImages: [{ type: String, require: true }]
}, { _id: false })
const SettingsSchema = new Schema({
    concourSession: { type: [SessionSchema], require: true },
    fieldOfStudy: { type: [FieldsofStudySchema], require: true },
    level: { type: [LevelSchema], require: true },
    center: { type: [CenterSchema], require: true },
    concourRequirements: { type: [ConcourRequirementsSchema], require: true },
    concourSubjects: { type: [ConcourModuleSchema], require: true },
    permissions: { type: [PermissionsSchema], require: true },
    roles: { type: [RoleSchema], require: true },
    paymentRequestType: { type: [PaymentRequestTypeSchema], require: true },
    citations: { type: CitationSchema, require: true }
})


const Settings = mongoose.model('Settings', SettingsSchema);
export default Settings;