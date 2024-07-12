import moment from "moment";
import mongoose from "mongoose";
import validator from "validator";
const Schema = mongoose.Schema;

const notifications = new Schema({
    message: String,
    date: {
      type: Date,
      default: Date.now
    },
    socket: String,
    from: String,
    documents: {
      type: [String],
      default: null
    },
    status: {
      type: String,
      enum: ["PENDING","READ"],
      default: "PENDING"
    }
})

const ehrSchema = new Schema({
    details: String,
    documents: {
      type: [String],
      default: null
    },
    test_date: {
      type: Date,
      default: Date.now
    },
    lab: String,
    doctor: String
})

const prescriptionSchema = new Schema({
  drug: String,
  quantity: Number,
  info: String,
  prescription_date: {
    type: Date,
    default: Date.now
  }
})

const consultationSchema = new Schema({
    date: {
      type: Date,
      default: Date.now
    },
    room: String,
    status: {
      type: String,
      enum: ["ONGOING","DONE"],
      default: "ONGOING"
    },
    prescription: {
      type: [prescriptionSchema],
      default: null
    },
    user: String
})

const appointmentSchema = new Schema({
  date: Date,
  details: String,
  commonId: String,
  status: {
    type: String,
    enum: ["PENDING", "ACCEPTED", "DENIED"],
    default: "PENDING"
  },
  user: String,
  consultation: {
    type: consultationSchema,
    default: null
  }
});
 
export const userSchema = new Schema({
  fullname: String,
  email: String,
  tel: String,
  password:String,
  status: {
    type: String,
    enum: ['PENDING', 'ACTIVE', 'INACTIVE'],
    default: 'PENDING'
  },
  gender: {
    type: String,
    enum: ['male','female'],
    default: 'male'
  },
  authToken: String,
  auth:{
    type: String,
    enum:['google','facebook','apple','email_and_password'],
    default: 'email_and_password'
  },
  image: {
    type: String,
    default: null
  },
  otp: {
    type:String,
    default: null
  },
  email_verified:{
    type: Boolean,
    default: false
  },
  role:{
          type: mongoose.Schema.Types.ObjectId,
          rel: "Role",
  },
  availability: {
    type: [Date],
    default: null
  },
  appointments: {
    type: [appointmentSchema],
    default: null
  },
  notifications: {
    type: [notifications],
    default: null
  },
  ehr: {
    type: [ehrSchema],
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Users", userSchema);