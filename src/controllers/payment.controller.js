import PaymentSchema from "../models/payment.model.js";
import * as hospitalService from "../services/hospital.service.js";
import dotenv from 'dotenv-flow';
dotenv.config({ path: 'local.env' });
import axios from "axios"

const verifyPayment = async (reference) => {
 const options = {method: 'GET', url: 'https://api.notchpay.co/payments/'+reference};

try {
  const { data } = await axios.request(options);
  console.log(data);
} catch (error) {
  console.error(error);
}

}

export const initiatePayment = async (req, res) => {
    console.log(process.env.NOTCHPAY_API_PUBLIC)
    try {
        const {_id, tel, details, amount, doctor} = req.body;
        const allHospitals = await hospitalService.getAllHospitals();
        var institute;
        const url = 'https://api.notchpay.co/payments'

        const initializePaymentResponse = await axios.post(url, 
            {
                amount: 50,
                currency: "XAF",
                description: details,
                customer: {
                  email: req.body.email,
                }
              },
            {
            Authorization: process.env.NOTCHPAY_API_PUBLIC, 
            'Content-Type': 'application/json'
          });
        console.log("PAYMENT INITIALIZED", initializePaymentResponse);

        const directChargeResponse = await axios.put(url+initializePaymentResponse?.transaction.reference,
            {
                channel: "cm.mobile",
                data: {
                  phone: "+237"+tel
                }
              },
              {
                Authorization: process.env.NOTCHPAY_API_PUBLIC, 
                "Accept": "application/json",
                'Content-Type': 'application/json'
              }
        );
        axios.get('https://api.notchpay.co/payments/'+url+initializePaymentResponse?.transaction.reference)
        .then(response => {
            console.log(response)
        })
        .catch(error => console.log(error))
        // verifyPayment(initializePaymentResponse?.transaction.reference);
        // for (let hospital of allHospitals) {
        //     const doctorObj = hospital.doctors.find(doc => doc.email == doctor);
        //     if(doctorObj)
        //     {
        //         institute = hospital;
        //         break
        //     }
        // }
        // const created = await PaymentSchema.create({
        //     user: _id,
        //     tel,
        //     details,
        //     amount,
        //     institute,
        //     status: "COMPLETED"
        // })
        return res.status(200).json({message: "Payment successful !"});
    } catch(error) {
        console.log("ERROR ", error.response);
        res.status(500).json({message: error.message});
    }
}
