import mong from 'mongoose'

const candidate=new mong.Schema({
session:{type:String},
Field:{type:String},
Level:{type:String},
Center:{type:String},
First_name:{type:String},
Register_date: {type:Date,default:Date.now},
Candidate_status:{type:String,default:"PENDING"},
Last_name:{type:String},
Gender:{type:String},
Email:{type:String},
Nationality:{type:String},
Region:{type:String},
Phone:{type:String},
Payment: {type:String},
Address: {type:String},
Dob:{type:Date},
Birth_Certificate:{type:String},
Id_card:{type:String},
Al_slip:{type:String}
})
export default mong.model("candidate",candidate)