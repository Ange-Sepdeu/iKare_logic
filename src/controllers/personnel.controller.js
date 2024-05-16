
import express from 'express'
import bodyParser from 'body-parser'
import Personnels from '../models/Personnels.js'
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { exec as execCb } from 'child_process';
import nodemailer from 'nodemailer';
import { mailMessages } from '../utils/helper.js';
import Joi from '@hapi/joi';

//Create a new Personnels
export const createPerso = async (req, res) => {
    try {
        const personalInfoSchema = Joi.object({
            name: Joi.string().required(),
            surName: Joi.string().required(),
            email: Joi.string().required(),
            gender: Joi.string().required(),
            dateOfBirth: Joi.date().required(),
            phone: Joi.string().required(),
            address: Joi.string().required(),
            nationality: Joi.string().required(),
            region: Joi.string().required(),
        });
        const schoolInfoSchema = Joi.object({
            department: Joi.string().required(),
            title: Joi.string().required(),
            contract: Joi.string().required(),
            status: Joi.string().required(),
        })
        const contactSchema = Joi.object({
            name: Joi.string().required(),
            profession: Joi.string().required(),
            phone: Joi.string().required(),
            gender: Joi.string().required(),
            email: Joi.string().required(),
        });
        const personalInfo = {
            name: req.body.personalInfo.Fname,
            surName: req.body.personalInfo.Lname,
            dateOfBirth: req.body.personalInfo.Dob,
            gender: req.body.personalInfo.Gender,
            email: req.body.personalInfo.Email,
            phone: req.body.personalInfo.phoneNumber,
            address: req.body.personalInfo.Address,
            nationality: req.body.personalInfo.nantionanlity,
            region: req.body.personalInfo.region,
        }
        const schoolInfo = {
            department: req.body.schoolInfo.department,
            title: req.body.schoolInfo.title,
            contract: req.body.schoolInfo.contract,
            status: req.body.schoolInfo.status,
        }
        let { error } = personalInfoSchema.validate(personalInfo);
        if (error)
            return res.status(500).send(error);
        let { error1 } = schoolInfoSchema.validate(schoolInfo);
        if (error1)
            return res.status(500).send(error1);
        let roles = []
        for (let index = 0; index < req.body.schoolInfo.role.length; index++) {
            console.log(req.body.schoolInfo.role[index])
            let name = req.body.schoolInfo.role[index];
            roles.push({ name: name })
        }
        let { error2 } = contactSchema.validate(req.body.contact);
        if (error2)
            return res.status(500).send(error2);
        const emailAddress = req.body.personalInfo.Email;
        const regex = /(.*)@.+\w+/;
        const strippedEmailAddress = regex.exec(emailAddress)[1];
        const email = strippedEmailAddress + "@iaicameroon.com"
        const existingUser = await Personnels.findOne({ 'personalInfo.email': personalInfo.email });
        if (existingUser) {
            return res.status(409).send({ message: 'Email already in use.' });
        }
        let name = req.body.personalInfo.Fname
        let randomPassword = ''
        for (let i = 0; i < 5; i++) {
            randomPassword += name[i]
        }
        for (let i = 0; i < 3; i++) {
            let temp = Math.floor(Math.random() * 10)
            randomPassword += temp
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(randomPassword, salt);
        // const verificationCode = Math.floor(100000 + Math.random() * 900000); // generates a six-digit number
        console.log("randomPassword", randomPassword);
        personalInfo.accountType = 'Personnel'
        personalInfo.token = ''
        personalInfo.schoolEmail = email
        personalInfo.password = hashedPassword
        personalInfo.passwordString = salt
        let newBody = {
            personalInfo: personalInfo,
            schoolInfo: schoolInfo,
            contacts: req.body.contact,
            documents: req.body.documents,
            roles: roles
        }
        const personnels = new Personnels(newBody)
        await personnels.save()
            .then(respond => {
                console.log(respond)
                // Send the verification code to the user's email
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.SENDER_EMAIL,
                        pass: process.env.EMAIL_PASSWORD,
                    },
                });
                const mailOptions = {
                    from: process.env.SENDER_EMAIL,
                    to: req.body.personalInfo.Email,
                    subject: 'Welcome To AICS',
                    html: mailMessages('create-personnel', { randomPassword, name }),
                    // text: `Your verification code is ${verificationCode}`,
                };

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });

            })
            .catch(err => console.log(err))

        return res.status(201).json({
            id: personnels._id,
            // personnels,
            message: 'Account created successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Server error.' });
    }
}
export const deletePerso = (req, res) => {
    const formeData = req.body.email;
    Personnels.deleteOne({ emailAddress: formeData })
        .then(result => {
            if (result.deletedCount === 0) {
                res.status(404).json({ message: 'User not found' })
            } else {
                res.json({ message: 'User deleted successfully' })
            }
        })
        .catch(err => {
            res.status(500).json({ message: 'Error deleting user ', error: err })
        })

}
// Update a Personnels by id
export const updatePerso = async (req, res) => {
    console.log("req.params.id", req.params.id)
    console.log("req.body", req.body)
    let hashedPassword;
    if (req.body.passwordChange) {
        let password = req.body.password
        const salt = await bcrypt.genSalt(10);
        hashedPassword = await bcrypt.hash(password, salt);
        req.body = {
            'personalInfo.password': hashedPassword,
            'personalInfo.passwordString': salt,
            'personalInfo.passwordChange': true,
        }
    }
    try {
        const personnel = await Personnels.findByIdAndUpdate(req.params.id, req.body, { new: true });
        // Check if the password was updated
        if (personnel.personalInfo.password === hashedPassword) {
            console.log("Password was updated.");
        } else {
            console.log("Password was not updated.");
        }
        res.send({ personnel });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Server error.' });
    }
}
// Delete a Personnels by id
export const deletePersoById = async (req, res) => {
    try {
        await Personnels.findByIdAndDelete({ _id: req.params.id });
        console.log("Deleted Successfully");
        res.status(201).send({ message: "Deleted Successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Faile to Delete User" });
    }

};
//Get all Personnels
export const getAllPerso = async (req, res) => {
    try {
        const personnels = await Personnels.find({})
        res.status(201).send({
            personnels: personnels,
            message: 'List all Personnels'
        })
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Server error.' });
    }

}
//Get all Personnels by id
export const getPersoById = async (req, res) => {
    try {
        const personnels = await Personnels.find({ _id: req.params.id });
        res.send({ personnels })
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Server error.' });
    }
};
//Update personal info of Personnels by id
export const updatePersoPersonalInfo = async (req, res) => {
    console.log(req.body);
    if (req.body.password) {
        password = req.body.password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        req.PersonalInfo = {
            'personalInfo.password': hashedPassword,
            'personalInfo.passwordString': salt
        }
        const personnels = await Personnels.findByIdAndUpdate({ _id: req.params.id }, req.PersonalInfo, { new: true });
    }
    // if(req.body.email){
    //     const verificationCode = crypto.randomBytes(5).toString('hex');
    //     const expiryTime = Date.now() + 30*60*1000; // 30 minutes from now
    //     const email = req.body.email
    //     // Save the verification code and expiry time in the session
    //     req.session.verification = {
    //         code: verificationCode,
    //         expiryTime: expiryTime,
    //         email:email
    //     };

    //     // Send the verification code to the user's email
    //     const transporter = nodemailer.createTransport({
    //         service: 'gmail',
    //         auth: {
    //             user: process.env.SENDER_EMAIL,
    //             pass: process.env.EMAIL_PASSWORD,
    //         },
    //     });

    //     const mailOptions = {
    //         from: process.env.SENDER_EMAIL,
    //         to: email,
    //         subject: 'Verification Code',
    //         text: `Your verification code is ${verificationCode}`,
    //     };

    //     transporter.sendMail(mailOptions, (error, info) => {
    //         if (error) {
    //             console.log(error);
    //         } else {
    //             console.log('Email sent: ' + info.response);
    //         }
    //     });
    //     req.PersonalInfo = {
    //       'personalInfo.email': email,
    //       'personalInfo.email_verification':false
    //   }
    //   const student = await Student.findByIdAndUpdate(req.body.id, req.PersonalInfo, { new: true }); 
    // }
    const personnels = await Personnels.findById(req.params.id);
    personnels.personalInfo = req.body;
    await personnels.save();
    res.send({
        message: "personal Info updated successfully"
    });
}
//Update school info of Personnels by id
export const updatePersoSchoolInfo = async (req, res) => {
    try {
        const personnels = await Personnels.findById(req.params.id);
        // const Personnels = await Personnels.findById(res.params.id);
        personnels.schoolInfo = req.body;
        await personnels.save();
        res.send({
            message: "school Info updated successfully"
        })
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Server error.' });
    }
}
// Update documents of Personnels by id
export const updatePersoDocuments = async (req, res) => {
    try {
        const personnels = await Personnels.findById(res.params.id);
        personnels.documents = req.body;
        await personnels.save();
        res.send({ personnels })
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Server error.' });
    }
}
//Update contact of Personnels by id
export const updatePersoContact = async (req, res) => {
    try {
        const personnels = await Personnels.findById(req.params.id);
        // const Personnels = await Personnels.findById(res.params.id);
        personnels.contacts = req.body;
        await personnels.save();
        res.send({
            message: "contact Info updated successfully"
        })
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Server error.' });
    }
}
//Upload Personnels document
export const uploadPersoImage = async (req, res) => {
    const id = req.params.id;
    let imageFiles = req.files.images; // Assuming 'images' is the fieldname for the files
    console.log(imageFiles);
    console.log(req.params.id);
    try {
        const personnels = await Personnels.findOne({ _id: id });
        console.log('Personnels found:', Personnels);


        if (!imageFiles) {
            return res.status(400).send('No files were uploaded.');
        }

        const currentDir = process.cwd();
        console.log("currentDir", currentDir);
        const uploadDir = path.join(currentDir, 'Personnel', 'files', `${personnels._id}`);
        const thumbnailDir = path.join(currentDir, 'Personnel', 'thumbnails', `${personnels._id}`);
        fs.mkdirSync(uploadDir, { recursive: true });
        fs.mkdirSync(thumbnailDir, { recursive: true });
        console.log("good here");
        // Ensure 'imageFiles' is always an array
        if (!Array.isArray(imageFiles)) {
            imageFiles = [imageFiles];
        }

        // Handle each uploaded file
        for (const file of imageFiles) {
            if (!file.mimetype.startsWith('image/')) {
                if (!file.mimetype.startsWith('application/pdf')) {
                    return res.status(400).send('Invalid file type. Only image or pdf files are allowed.');
                }
            }

            // Move the original file
            const uploadPath = path.join(uploadDir, file.name);
            await file.mv(uploadPath);

            // Generate and save the thumbnail
            if (file.mimetype.startsWith('image/')) {
                console.log(file.name, file.mimetype);
                const thumbnailPath = path.join(thumbnailDir, file.name);
                await sharp(uploadPath)
                    .resize(480) // You can set the desired size
                    .toFile(thumbnailPath);
            } else if (file.mimetype.startsWith('application/pdf')) {
                console.log(uploadPath)
                console.log(thumbnailDir)
                console.log(path.parse(file.name).name + ".jpg")
                // console.log("files good")
                async function convertPDFToImage() {
                    try {
                        const command = `pdftoppm -f 1 -l 1 "${uploadPath}" "${thumbnailDir}/temp"`;
                        let { stdout, stderr } = await exec(command);
                        console.log("files good");
                        console.log(`stdout: ${stdout}`);
                        console.error(`stderr: ${stderr}`);

                        // Rename the file
                        await fs.rename(`${thumbnailDir}/temp-000001.ppm`, `${thumbnailDir}/temp-1.ppm`, (err) => {
                            if (err) {
                                console.log('Error renaming file: ', err);
                                return;
                            }

                            const command1 = `magick ${path.join(thumbnailDir, 'temp-1.ppm')}  "${path.join(thumbnailDir, path.parse(uploadedFile.name).name)}.jpg"`;
                            exec(command1, async (error, stdout, stderr) => {
                                if (error) {
                                    console.error(`exec error: ${error}`);
                                    return;
                                }
                                console.log(`stdout: ${stdout}`);
                                console.error(`stderr: ${stderr}`);

                                try {
                                    fs.unlinkSync(`${thumbnailDir}/temp-1.ppm`);
                                    console.log('File deleted successfully');
                                } catch (err) {
                                    console.error(`Error deleting file: ${err}`);
                                }

                                return res.status(200).send({ id: student._id, name: `${path.parse(uploadedFile.name).name}.jpg` });
                            });
                        });
                    } catch (error) {
                        console.error(`exec error: ${error}`);
                    }
                }

                convertPDFToImage();
            }
            // Save image name to DB
            personnels.documents.images.push(file.name);
        }

        // Update the activity in the database
        await personnels.save();

        res.status(200).send({ message: 'Images uploaded, thumbnails created and image names saved to the DB successfully.' });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ error: 'An error occurred while processing images.' });
    }
};
// export const uploadPersoImage = async (req, res) => {
    //
// };
