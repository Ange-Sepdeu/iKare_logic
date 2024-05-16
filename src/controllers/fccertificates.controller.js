import mongoose from 'mongoose';
import FCCertificates from '../models/FCCertificates.js'
import BaseJoi from 'joi';
import JoiDate from '@hapi/joi-date';

const Joi = BaseJoi.extend(JoiDate);


function convertToDateObject(dateString) {
    if(!dateString){
        console.log('invalid Date');
        console.log(dateString);
        return "error"
    }else{
        const [day, month, year] = dateString.split('/');
        const isoDateString = `${year}-${month}-${day}`;
        return new Date(isoDateString);
    }
}

const FCCertValidationSchema = Joi.object({
    name: Joi.string().required(),
    surName: Joi.string().required(),
    gender: Joi.string().valid('M', 'F').required(),
    modules: Joi.array().items(Joi.string().trim().required()).required(),
    region:Joi.string().required(),
    email: Joi.string().required(),
    center: Joi.string().required(),
    startDate: Joi.alternatives()
        .try(
            Joi.date().iso(),
            Joi.date().format('DD/MM/YYYY')
        )
        .required(),
    endDate: Joi.alternatives()
        .try(
            Joi.date().iso(),
            Joi.date().format('DD/MM/YYYY')
        )
        .required(),
    dob: Joi.alternatives()
        .try(
            Joi.date().iso(),
            Joi.date().format('DD/MM/YYYY')
        )
        .required(),
});
export const getCertificates = async (req, res) => {

    try {
      const allCertificates = await FCCertificates.find();  
      console.log(allCertificates);
      return res.status(200).json({
        Luarates: allCertificates,
        message: 'List Luarates'
      })
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: 'Server error.' });
    }
  };

export async function createCertificates(req, res) {
    try {
        const data = req.body;

        if (!Array.isArray(data)) {
            return res.status(400).send({message:'Expected an Array of data.'});
        }

        for (const item of data) {
            console.log(item);
            if (!item.startDate) {
                return res.status(400).json({message:`Missing or undefined startDate for ${item.name + ' ' + item.surName}`});
            }else{
                item.startDate = convertToDateObject(item.startDate);
            if (!item.endDate) {
                return res.status(400).json({message: `Missing or undefined endDate for ${item.name + ' ' + item.surName}`});
            }else{
                item.endDate = convertToDateObject(item.endDate);
            }
            if (!item.dob) {
                return res.status(400).json({message:`Missing or undefined dob for ${item.name + ' ' + item.surName}`});
            }else{
                item.dob = convertToDateObject(item.dob);
            }
            
            if(item.startDate === "error"||  item.endDate === "error" || item.dob === "error"){
                return res.status(400).json({message:`Error processing dates for ${item.name +' '+ item.surName}:`})
            }
        }
            const validation = FCCertValidationSchema.validate(item);
            if (validation.error) {
                return res.status(400).json({message:`Validation Error for ${item.name +' '+ item.surName}: ${validation.error.details[0].message}`});
            }
        }

            const insertedCertificates = await FCCertificates.insertMany(data);
           return  res.status(200).json({
                Luarates: insertedCertificates,
                message: 'Luarates inserted! Successfully'
            });

    } catch (error) {
        console.error(error);
        res.status(500).send(process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error');
    }
}
            