import bcrypt from "bcrypt";
import * as roleService from "../services/role.service.js"
import * as hospitalService from "../services/hospital.service.js";
import * as userService from "../services/user.service.js"

export const startConsultation = async(req, res) => {
    const {room, doctor, patient, appointment} = req.body;
    try {
      const emailPatient = patient
      const patientObject = await userService.getUserByEmail(emailPatient);
      const hospitalObj = await hospitalService.getHospitalById(hospital?._id);
      const doctorObj = hospitalObj.doctors.find(doc => doc._id === doctor?._id);
      doctorObj.appointments.forEach(appt => {
        if (appt.commonId === appointment?.commonId) {
          appt.consultation.room=room;
          appt.consultation.user=patientObject?.fullname;
        }
      })
      patientObject.appointments.forEach(appt => {
        if (appt.commonId === appointment?.commonId) {
          appt.consultation.room=room;
          appt.consultation.user = doctor?.fullname
        }
      })
      try {
        const booked = patientObject.save();
        const isBooked = hospitalObj.save();
        return res.status(200).json({message: "Consultation started successfully !"});
      }catch(error) {
        console.error(error);
        }
    }catch(error) {
        console.error(error)
    }
}

export const endConsultation = async (req, res) => {
  const {room, doctor, patient, appointment} = req.body;
  try {
    const patientObject = await userService.getUserByEmail(patient?.email);
    const hospitalObj = await hospitalService.getHospitalById(hospital?._id);
    const doctorObj = hospitalObj.doctors.find(doc => doc._id === doctor?._id);
    doctorObj.appointments.forEach(appt => {
      if (appt.commonId === appointment?.commonId) {
        appt.consultation.status="DONE"
      }
    })
    patientObject.appointments.forEach(appt => {
      if (appt.commonId === appointment?.commonId) {
        appt.consultation.status="DONE"
      }
    })
    try {
      const booked = patientObject.save();
      const isBooked = hospitalObj.save();
      return res.status(200).json({message: "Consultation ended successfully !"});
    }catch(error) {
      console.error(error);
      }
  }catch(error) {
      console.error(error)
  } 
}

export const issuePrescription = async(req, res) => {
    const {doctor, hospital, prescription, patient, appointment} = req.body;
    try {
      const patientObject = await userService.getUserByEmail(patient?.email);
      const hospitalObj = await hospitalService.getHospitalById(hospital?._id);
      const doctorObj = hospitalObj.doctors.find(doc => doc._id === doctor?._id);
      patientObject.appointments.forEach(appt => {
          if(appt.commonId === appointment?.commonId) {
              appt.consultation.prescription = prescription;
          }
      })
      doctorObj.appointments.forEach(appt => {
          if (appt.commonId === appointment?.commonId) {
              appt.consultation.prescription = prescription;
          }
      })
      try {
        const booked = patientObject.save();
        const isBooked = hospitalObj.save();
        return res.status(200).json({message: "Prescription issued successfully !"});
      }catch(error) {
        console.error(error);
        }
    }catch(error) {
      console.error(error)
    }
}

export const deletePrescription = async (req, res) => {
    const {doctor, hospital, patient, appointment} = req.body;
    try {
      const patientObject = await userService.getUserByEmail(patient?.email);
      const hospitalObj = await hospitalService.getHospitalById(hospital?._id);
      const doctorObj = hospitalObj.doctors.find(doc => doc._id === doctor?._id);
      patientObject.appointments.forEach(appt => {
          if(appt.commonId === appointment?.commonId) {
              appt.consultation.prescription = [];
          }
      })
      doctorObj.appointments.forEach(appt => {
          if (appt.commonId === appointment?.commonId) {
              appt.consultation.prescription = [];
          }
      })
      try {
        const booked = patientObject.save();
        const isBooked = hospitalObj.save();
        return res.status(200).json({message: "Prescription deleted successfully !"});
      }catch(error) {
        console.error(error);
        }
    }catch(error) {
      console.error(error)
    }
}