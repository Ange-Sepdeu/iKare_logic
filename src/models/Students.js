import mongoose from "mongoose";
const { Schema } = mongoose;


const PaymentSchema = new Schema({
    amountPaid: { type: Number, require: true },
    paidDate: { type: Date, require: true },
    paymentMethod: { type: String, require: true },
    receivedBy: { type: String, require: true }
}, { _id: false });
const ModifiedSchema = new Schema([{
    preMark: { type: Number, require: true },
    modMark: { type: Number, require: true },
    modifiedBy: { type: String, require: true },
    modifiedOn: { type: Date, require: true },

}], { _id: false });
const subjectMarkschema = new Schema({
    currentMark: { type: Number, require: true, default: 0 },
    modified: { type: [ModifiedSchema], require: true }
}, { _id: false });
const SessionSchema = new Schema([{
    sessionName: { type: String, require: true },
    field: { type: String, require: true },
    level: { type: String, require: true },
    dateOfConcour: { type: Date, require: true },
    center: { type: String, require: true },
    result: {
        type: String,
        enum: ['Passed', 'Waiting List', 'Failed'],
        require: true
    },
    averageMark: { type: Number, require: true, default: 0 },
    finalMark: { type: Number, require: true, default: 0 },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected'],
        require: true
    },
    totalAmount: { type: Number, require: true },
    payment: { type: [PaymentSchema], require: true },
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
}], { _id: false });

const PenaltySchema = new Schema({
    totalAmount: { type: Number, require: true },
    installments: { type: [PaymentSchema], require: true },
}, { _id: false });

const FeesSchema = new Schema([{
    name: { type: String, require: true },
    totalAmount: { type: Number, require: true },
    dateline: { type: Date, require: true },
    payments: { type: [PaymentSchema], require: true },
    penalty: { type: [PenaltySchema], require: true }
}], { _id: false });



const CASMarkchema = new Schema({
    currentMark: { type: Number, require: true },
    module: { type: [ModifiedSchema], require: true }
}, { _id: false });

const ExamsMarkSchema = new Schema({
    currentMark: { type: Number, require: true },
    module: { type: [ModifiedSchema], require: true }
}, { _id: false });

const ResistMarkSchema = new Schema({
    currentMark: { type: Number, require: true },
    module: { type: [ModifiedSchema], require: true }
}, { _id: false });

const CourseSchema = new Schema({
    title: { type: String, require: true },
    code: { type: String, require: true },
    teacher: { type: String, require: true },
    coefficient: { type: Number, require: true },
    CAMark: { type: [CASMarkchema], require: true },
    ExamsMark: { type: [ExamsMarkSchema], require: true },
    ResistMark: { type: [ResistMarkSchema], require: true },
    CourseAverage: { type: Number, require: true }
}, { _id: false });


const ModuleSchema = new Schema([{
    courses: { type: [CourseSchema], require: true },
    moduleAverage: { type: Number, require: true },
    moduleCredits: { type: Number, require: true },
    status: { type: String, require: true }
}], { _id: false });

const SemesterSchema = new Schema([{
    name: { type: [String], require: true },
    semesterTotalPoints: { type: Number, require: true },
    semesterAverage: { type: Number, require: true },
    semesterRank: { type: Number, require: true },
    semesterCredits: { type: Number, require: true },
    absences: {
        month: { type: Number, require: true }
    },
    semesterDiscipline: { type: [String], require: true },
    modules: { type: [ModuleSchema], require: true }
}], { _id: false });
const RegistrationSchema = new Schema({

})
const AcademicYearSchema = new Schema([{
    year: { type: String, require: true },
    class: { type: String, require: true },
    fees: { type: FeesSchema, require: true },
    registration: {
        amount: { type: Number, require: true },
        penality: { type: Number, require: true },
        paidDate: { type: Date, require: true },
        paymentMethod: { type: String, require: true },
        receivedBy: { type: String, require: true }
    },
    semesters: { type: [SemesterSchema], require: true },
    annualTotalPoints: { type: Number, require: true },
    annualAverage: { type: Number, require: true },
    annualRank: { type: Number, require: true },
    conduct: { type: String, require: true },
    annualCredits: { type: Number, require: true },
    annualHourOfAbsences: { type: Number, require: true },
    annualDiscipline: { type: [String], require: true },
    finalDecision: { type: String, require: true }
}], { _id: false });

const ContactSchema = new Schema({
    name: { type: String, require: true },
    profession: { type: String, require: true },
    email: { type: String, require: true },
    address: { type: String, require: true },
    phone: { type: String, require: true },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        require: true
    }
}, { _id: false });
const RoleSchema = new Schema([{
    name: { type: String, require: true },
}, { _id: false }]);

const StudentSchema = new Schema({
    personalInfo: {
        name: { type: String, require: true },
        surName: { type: String, require: true },
        accountType: { type: String, require: true },
        token: { type: String, require: true },
        status: { type: Boolean, default: false, require: true },
        matricule: { type: String, require: true },
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
        email_verification: {
            type: Boolean,
            default: false
        },
        phone: { type: String, require: true },
        address: { type: String, require: true },
        nationality: { type: String, require: true },
        region: { type: String, require: true },
        maritalStatus: {
            type: String,
            enum: ['Single', 'Married'],
            require: true
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        location: Object,
    },
    academicInfo: {
        field: { type: String, require: true },
        level: { type: Number, require: true },
        center: { type: String, require: true },
        concourSessions: { type: [SessionSchema], require: true },
        academicYears: { type: [AcademicYearSchema], require: true },
    },
    documents: { type: Object, require: true },
    contacts: {
        parent: { type: ContactSchema, require: true },
        personToContact: { type: ContactSchema, require: true }
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    roles: { type: [RoleSchema], require: true },
});

const Student = mongoose.model('Student', StudentSchema);
export default Student;
