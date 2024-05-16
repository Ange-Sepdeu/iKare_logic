import { SENDMAIL } from "../utils/sendmail.js";
import { ValidationSchema } from "../utils/schema.js";


export const sendEmail =async(req,res)=>{

    const { error, value } = ValidationSchema.emailSchema.validate(req.body, {
        abortEarly: false,
      });
      if (error) {
        return res.status(500).json({ error: JSON.stringify(error) });
      } 


    SENDMAIL(req.body,(info)=>{
        if(info.messageId){
            return res.status(200).json({data: info, status:'success',message:`Send mail to ${req.body.to} successfully` });
        }else{
            return res.status(500).json({ error: 'An error occured while sending mail' });
        }
    })
}