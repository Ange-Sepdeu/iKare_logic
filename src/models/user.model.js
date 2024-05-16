import mongoose from "mongoose";
const Schema = mongoose.Schema;
 
const userSchema = new Schema({
  firstname: String,
  lastname: String,
  tel:String,
  age: Number,
  password:{
    type: String,
    default: null
  },
  gender: {
    type: String,
    enum: ['male','female','other'],
    default: 'male'
  },
  auth:{
    type: String,
    enum:['google','facebook','apple','email_and_password'],
    default: 'email_and_password'
  },
  type:{
    type: String,
    enum:['entreprise','particulier'],
    default: 'particulier'
  },
  location: Object,
  email: String,
  ville: String,
  pays: String,
  dob: Date,
  category: Array,
  piece_indentite:Object,
  document: Array,
  authToken: {
    type: String,
    default : null
  },
  image: String,
  verified:{
    type: Boolean,
    default: false
  },
  roles: [
               {
                    type: mongoose.Schema.Types.ObjectId,
                    rel: "Role",
               }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

export default mongoose.model("Users", userSchema);