import Student from '../models/Students.js';
import Personnel from '../models/Personnels.js'
import Settings from '../models/Settings.js';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import validator from 'validator';
import jwt from 'jsonwebtoken';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { generateString, mailMessages } from "../utils/helper.js";
import axios from "axios";
import { promisify } from 'util';
import { exec as execCb } from 'child_process';
// import qs from 'qs'; // to stringify our POST body
import Joi from '@hapi/joi';
import { log } from 'console';
import moment from 'moment';


export const registerCandidate = async (req, res) => {
    try {
        const { email, password, passwordConfirmation, checkbox, recaptchaValue } = req.body;
        // Email validation
        if (!checkbox) {
            return res.status(400).send({ message: 'Terms and Conditions not Accepted' });
        }
        if (!validator.isEmail(email)) {
            return res.status(400).send({ message: 'Invalid email.' });
        }

        const existingUser = await Student.findOne({ 'personalInfo.email': email });
        if (existingUser) {
            return res.status(409).send({ message: 'Email already in use.' });
        }

        // reCAPTCHA validation
        //  const recaptchaResponse = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
        //     params: {
        //         secret: process.env.RECAPTCHA_SECRET_KEY, 
        //         response: recaptchaValue,
        //     },
        //     });

        //     if (!recaptchaResponse.data.success) {
        //         return res.status(400).send({ error: 'Invalid reCAPTCHA.' });
        //     }

        // Password validation
        if (password.length < 8) {
            return res.status(400).send({ message: 'Password must be at least 8 characters.' });
        }

        if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
            return res.status(400).send({ message: 'Password must contain at least one lowercase letter, one uppercase letter, and one digit.' });
        }


        if (password !== passwordConfirmation) {
            return res.status(400).send({ message: 'Passwords do not match.' });
        }


        // Save the verification code and expiry time in the session
        const verificationCode = Math.floor(100000 + Math.random() * 900000); // generates a six-digit number

        const token = jwt.sign({ email, code: verificationCode }, process.env.JWT_TOKEN_KEY, { expiresIn: '30m' });
        console.log(verificationCode);
        // Store the token on the server
        //   userTokens[email] = token;
        let accountType = 'Candidate'
        let data = {
            accountType,
            verificationCode
        }
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
            to: email,
            subject: 'Verification Code',
            html: mailMessages('create-account', data),
            // text: `Your verification code is ${verificationCode}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        console.log(token);
        // Create a new student but don't save yet
        let student = new Student({

        });
        student.personalInfo = {
            accountType: "Participant",
            status: true,
            email: email,
            token: token,
            password: hashedPassword,
            passwordString: salt,
        }

        const save = await student.save()
        console.log(save.email);

        if (save) {
            res.status(200).send({
                "email": email,
                "email_verification": false,
                token: token,
                success: true,
                message: 'A verification code has been sent to your email. Please enter the code to complete registration.'
            });
        }

    } catch (error) {
        console.error(error);
        res.status(501).send({ message: 'Please Contact The Administrator !.' });
    }
}

export const verifyCandidate = async (req, res) => {
    try {
        const { email, verificationCode } = req.body;
        let user, modelName;

        // Find user by email in both Student and Personnel models
        const student = await Student.findOne({ 'personalInfo.email': email }).exec();
        const personnel = await Personnel.findOne({ 'personalInfo.email': email }).exec();

        // Check if user exists in either model
        if (student) {
            user = student;
            modelName = 'Student';
        } else if (personnel) {
            user = personnel;
            modelName = 'Personnel';
        } else {
            return res.status(401).send({ error: 'Invalid User.' });
        }

        // Check for verification token
        const mytoken = user.personalInfo.token;
        if (!mytoken) {
            return res.status(400).send({ message: 'No verification token found.' });
        }

        // Verify the token
        let decoded;
        try {
            decoded = await jwt.verify(mytoken, process.env.JWT_TOKEN_KEY);
        } catch (err) {
            console.log(err);
            return res.status(400).send({ message: 'Invalid verification code.' });
        }

        // Check the verification code
        if (decoded.code !== parseInt(verificationCode)) {
            return res.status(400).send({ message: 'Invalid verification code.' });
        }

        // Update email verification status
        const updatedUser = await user.constructor.findOneAndUpdate(
            { 'personalInfo.email': decoded.email },
            { $set: { 'personalInfo.email_verification': true } },
            { new: true }
        );

        res.status(201).send({
            user: updatedUser,
            success: true,
            message: modelName === 'Personnel' ? 'Verification successful.' : 'Registration successful.'
        });

    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Server error.' });
    }
};

export const createCandidate = async (req, res) => {
    try {
        function capitalizeFirstLetter(str) {
            return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        }
        const email = req.body.personalInfoForm.email
        const personalInfoSchema = Joi.object({
            name: Joi.string().required(),
            surName: Joi.string().required(),
            email: Joi.string().email().required(),
            dateOfBirth: Joi.date().required(),
            address: Joi.string().required(),
            nationality: Joi.string().required(),
            region: Joi.string().required(),
            gender: Joi.string().valid('male', 'female', 'other').required(),
            phone: Joi.string().required(),
            maritalStatus: Joi.string().required()
        });
        const concourExamSchema = Joi.object({
            session: Joi.date().required(),
            field: Joi.string().required(),
            level: Joi.string().required(),
            center: Joi.string().required()

        })
        const guardianSchema = Joi.object({
            parentName: Joi.string().required().min(1),
            parentProfession: Joi.string().required(),
            parentEmail: Joi.string().email().required().min(1),
            parentPhone: Joi.string().required(),
            parentAddress: Joi.string().required(),
            parentGender: Joi.string().required(),
            personToContactName: Joi.string().required(),
            personToContactPhone: Joi.string().required(),
            personToContactGender: Joi.string().required(),
            personToContactProfession: Joi.string().required(),
            personToContactEmail: Joi.string().email().required().min(1),
            personToContactAddress: Joi.string().required(),
        })
        const paymentSchema = Joi.object({
            method: Joi.string().required(),
            phoneNumber: Joi.string().required(),
            amount: Joi.number().required()
        })
        // const myDocumentsSchema = Joi.object().required();
        let concourSession = req.body.concourExam
        let guardian = req.body.guardian
        // let documents = req.body.myDocuments
        let payment = req.body.payment
        console.log(guardian);
        const personalInfo = {
            name: req.body.personalInfoForm.fname,
            surName: req.body.personalInfoForm.lname,
            email: req.body.personalInfoForm.email,
            dateOfBirth: req.body.personalInfoForm.dob,
            address: req.body.personalInfoForm.address,
            nationality: req.body.personalInfoForm.nationality,
            region: req.body.personalInfoForm.region,
            gender: req.body.personalInfoForm.gender.toLowerCase(),
            phone: req.body.personalInfoForm.tel,
            maritalStatus: req.body.personalInfoForm.maritalStatus
        }
        console.log("here3")
        if (personalInfoSchema.validate(personalInfo).error)
            return res.status(409).send({ message: "Fill all the Values of the Personal Information form" });
        if (concourExamSchema.validate(concourSession).error)
            return res.status(408).send({ message: "Fill all the Values of the Concour Session form" });
        if (guardianSchema.validate(guardian).error)
            return res.status(407).send({ message: "Fill all the Values of the Parent Information form" });
        console.log("here5")
        if (paymentSchema.validate(payment).error)
            return res.status(405).send({ message: "Fill all the Values of the Payment form" });
        let concourDate = new Date(concourSession.session);
        let sessionDetail = {}
        let concourSessionDetail = {}
        console.log("here4")
        console.log(concourDate);
        await Settings.findOne({ 'concourSession.dateOfConcour': concourDate })
            .then(result => {
                if (result) {
                    // Find the specific concourSession from the result
                    concourSessionDetail = result.concourSession.filter((option) => moment(option.dateOfConcour).format('D MMMM yyyy') === moment(concourDate).format('D MMMM yyyy'))[0];
                } else {
                    return res.status(404).send({ message: "This Session is not more valid please take another one2" });
                }
            })
            .catch(err => {
                return res.status(404).send({ message: "This Session is not more valid please take another one3" });
            });
        if (concourSessionDetail.status) {
            sessionDetail = {
                sessionName: concourSessionDetail.sessionName,
                field: concourSession.field,
                level: concourSession.level,
                dateOfConcour: concourDate,
                center: concourSession.center,
                results: '',
                averageMark: 0,
                status: "Pending",
                totalAmount: concourSessionDetail.totalAmount,
                payment: {
                    amountPaid: concourSessionDetail.totalAmount,
                    paidDate: new Date(),
                    paymentMethod: payment.method,
                    receivedBy: "Admin Name",
                },
                subject: concourSessionDetail.subject.filter(subject => subject.status === true)
            }
        } else {
            return res.status(404).send({ message: "This Session is not more valid please take another one1" });
        }
        const students = await Student.findOne({ 'personalInfo.email': personalInfo.email })
        let concour = await students.academicInfo.concourSessions
        let allRegisted = concour.filter((option) => moment(option.dateOfConcour).format('D MMMM yyyy') === moment(sessionDetail.dateOfConcour).format('D MMMM yyyy'))[0]
        console.log("here1")
        if (allRegisted)
            return res.status(403).send({ message: "You have already registed for this session" });
        concour.push(sessionDetail)
        students.personalInfo = {
            accountType: 'Candidate',
            name: personalInfo.name,
            surName: personalInfo.surName,
            email: personalInfo.email,
            dateOfBirth: personalInfo.dateOfBirth,
            address: personalInfo.address,
            nationality: personalInfo.nationality,
            region: personalInfo.region,
            gender: capitalizeFirstLetter(personalInfo.gender),
            phone: personalInfo.phone,
            maritalStatus: personalInfo.maritalStatus,
        }
        students.academicInfo = {
            concourSessions: concour
        }
        // students.documents = documents
        students.contacts = {
            parent: {
                name: guardian.parentName,
                profession: guardian.parentProfession,
                email: guardian.parentEmail,
                phone: guardian.parentPhone,
                address: guardian.parentAddress,
                gender: capitalizeFirstLetter(guardian.parentGender),
            },
            personToContact: {
                name: guardian.personToContactName,
                phone: guardian.personToContactPhone,
                gender: capitalizeFirstLetter(guardian.personToContactGender),
                profession: guardian.personToContactProfession,
                email: guardian.personToContactEmail,
                address: guardian.personToContactAddress,
            },
        }
        // implement the payment here !!!
        console.log("here2")
        await Student.findOneAndUpdate({ 'personalInfo.email': personalInfo.email }, {
            'contacts': students.contacts,
            // 'documents': documents,
            'academicInfo.concourSessions': students.academicInfo.concourSessions,
            'personalInfo.accountType': 'Candidate',
            'personalInfo.name': personalInfo.name,
            'personalInfo.surName': personalInfo.surName,
            'personalInfo.email': personalInfo.email,
            'personalInfo.dateOfBirth': personalInfo.dateOfBirth,
            'personalInfo.address': personalInfo.address,
            'personalInfo.nationality': personalInfo.nationality,
            'personalInfo.region': personalInfo.region,
            'personalInfo.gender': capitalizeFirstLetter(personalInfo.gender),
            'personalInfo.phone': personalInfo.phone,
            'personalInfo.maritalStatus': personalInfo.maritalStatus,
        })
            .then(updateResult => {
                console.log("mail senting 1")
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.SENDER_EMAIL,
                        pass: process.env.EMAIL_PASSWORD,
                    },
                });
                const mailOptions = {
                    from: process.env.SENDER_EMAIL,
                    to: email,
                    subject: 'Verification Code',
                    html: mailMessages('registration-success', sessionDetail),
                    // text: `Your verification code is ${verificationCode}`,
                };
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log(error);
                    } else {
                        // console.log('Email sent: ' + info.response);
                        res.status(200).send({ message: "Concour Registration Successfully" });
                    }
                });
                console.log("mail sent")
            })
            .catch(err => {
                res.status(500).send({ message: 'Please check you connection and try later' });
            })
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: 'Please check you connection and try later' });
    }
}
export const login = async (req, res) => {
    let user, modelName, token;
    try {
        const { email, password } = req.body;

        // validate input
        if (!email || !password) {
            return res.status(400).send({ error: 'Email and password must be provided.' });
        }

        // find by email in Student model
        const student = await Student.findOne({ 'personalInfo.email': email });

        // find by email in Personnel model
        const personnel = await Personnel.findOne({ 'personalInfo.email': email });

        // Check if neither exists
        if (!student && !personnel) {
            return res.status(401).send({ error: 'Invalid email or password.' });
        }

        // Determine which model has the matching email and then verify password

        if (personnel) {
            user = personnel;
            modelName = 'Personnel';
        } else {
            user = student;
            modelName = 'Student';
        }
        console.log(user);
        const validPassword = await bcrypt.compare(password, user.personalInfo.password);
        if (!validPassword) {
            return res.status(401).send({ error: 'Invalid email or password.' });
        }
        console.log(user.personalInfo.status);
        // Check email verification status
        // if (!user.personalInfo.status) {
        //     return res.status(403).send({ error: 'Access Denied.' });
        // }

        if (modelName === 'Personnel') {
            // Generate JWT token
            token = jwt.sign(
                {
                    email,
                    name: user.personalInfo.name,
                    accountType: user.personalInfo.accountType,
                    passwordChange: user.personalInfo.passwordChange,
                    id: user._id,
                    modelName // Include the model name to distinguish between Student and Personnel
                },
                process.env.JWT_TOKEN_KEY,
                { expiresIn: '2h' }
            );
            // Update token in database
            await user.updateOne({ 'personalInfo.token': token });
            // Check email verification again
            if (!user.personalInfo.passwordChange) {
                return res.status(403).send({
                    error: 'Please Update Your Password First',
                    token: token
                });
            }

        } else {

            // Generate JWT token
            token = jwt.sign(
                {
                    email,
                    name: user.personalInfo.name,
                    accountType: user.personalInfo.accountType,
                    email_verification: user.personalInfo.email_verification,
                    id: user._id,
                    modelName // Include the model name to distinguish between Student and Personnel
                },
                process.env.JWT_TOKEN_KEY,
                { expiresIn: '2h' }
            );
            // Update token in database
            await user.updateOne({ 'personalInfo.token': token });
            // Check email verification again
            if (!user.personalInfo.email_verification) {
                return res.status(403).send({
                    error: 'Please verify your email first.',
                    token: token
                });
            }
        }


        res.status(200).send({
            token: token,
            message: 'Login successful.',
        });

    } catch (error) {
        console.error(error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).send({ error: 'Invalid token.' });
        } else {
            return res.status(500).send({ error: 'An error occurred while attempting to log in.' });
        }
    }
};
export const logout = async (req, res) => {
    let user = {}
    try {
        // console.log(req.body);
        let token = req.body.token
        const decoded_user_payload = jwt.verify(token, process.env.JWT_TOKEN_KEY);
        console.log(decoded_user_payload);
        const email = decoded_user_payload.email;
        if (decoded_user_payload.accountType === 'Personnel') {
            const updatedUser = await Personnel.findOneAndUpdate(
                { 'personalInfo.email': decoded_user_payload.email },
                { $set: { 'personalInfo.token': '' } },
                { new: true }
            );
        } else {
            const updatedUser = await Student.findOneAndUpdate(
                { 'personalInfo.email': decoded_user_payload.email },
                { $set: { 'personalInfo.token': '' } },
                { new: true }
            );
        }
        return res.status(410).json({ message: "Logout successfully" });
    } catch (err) {
        return res.status(410).json({ message: "logout" });
    }
}
export const addCandidateFiles = async (req, res) => {
    const exec = promisify(execCb);
    const file = req.files
    const email = req.body.email
    const fileName = req.body.fileName
    console.log(email);
    try {
        const student = await Student.findOne({ 'personalInfo.email': email }, {
            _id: 1,
            "documents": 1
        });
        console.log('Student found:', student);
        console.log(`The student ID for ${email} is ${student._id}`);
        let doc = student.documents || {};
        doc[fileName] = false;
        student.documents = {}
        student.documents = doc
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('No files were uploaded.');
        }

        const currentDir = process.cwd()
        let uploadedFile = req.files.file;
        console.log(uploadedFile)
        let uploadDir = path.join(currentDir, "Scolarite", "Applicant_Documents", `${student._id}`)
        let uploadDir1 = path.join(currentDir, 'Scolarite', 'thumbnails', `${student._id}`)
        fs.mkdirSync(uploadDir, { recursive: true });
        fs.mkdirSync(uploadDir1, { recursive: true });
        let uploadPath = path.join(uploadDir, uploadedFile.name)
        console.log(uploadPath);
        if (!(uploadedFile.mimetype === 'application/pdf' || uploadedFile.mimetype.startsWith('image/'))) {
            return res.status(400).send('Invalid file type. Only PDF and image files are allowed.');
        }
        const moveFile = new Promise((resolve, reject) => {
            uploadedFile.mv(uploadPath, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        await moveFile;

        if (uploadedFile.mimetype === 'application/pdf') {

            console.log(uploadPath)
            console.log(uploadDir1)
            console.log(path.parse(uploadedFile.name).name + ".jpg")

            async function convertPDFToImage() {
                try {
                    const command = `pdftoppm -f 1 -l 1 "${uploadPath}" "${uploadDir1}/temp"`;
                    let { stdout, stderr } = await exec(command);
                    console.log(`stdout: ${stdout}`);
                    console.error(`stderr: ${stderr}`);
                    const files = fs.readdirSync(uploadDir1);
                    const filesTorename = files.find(file => /^temp-\d+\.ppm$/.test(file));
                    console.log(filesTorename)
                    await fs.rename(`${uploadDir1}/${filesTorename}`, `${uploadDir1}/temp-1.ppm`, (err) => {
                        if (err) {
                            console.log('Error renaming file: ', err);
                            return res.status(400).send({ error: "an error occur please reload you document" });
                        }

                        const command1 = `magick ${path.join(uploadDir1, 'temp-1.ppm')}  "${path.join(uploadDir1, path.parse(uploadedFile.name).name)}.jpg"`;
                        exec(command1, async (error, stdout, stderr) => {
                            if (error) {
                                console.error(`exec error: ${error}`);
                                return res.status(400).send({ error: "an error occur please reload you document" });
                            }
                            console.log(`stdout: ${stdout}`);
                            console.error(`stderr: ${stderr}`);

                            try {
                                fs.unlinkSync(`${uploadDir1}/temp-1.ppm`);
                                console.log('File deleted successfully');
                            } catch (err) {
                                console.error(`Error deleting file: ${err}`);
                            }
                            console.log('Student found:', student);
                            student.save()
                                .then(data => {
                                    console.log('Student found:', data);
                                    return res.status(200).send({ id: student._id, name: `${path.parse(uploadedFile.name).name}.jpg` });
                                })
                                .catch(err => {
                                    console.log(err)
                                    return res.status(400).send({ error: "an error occur please reload you document" });
                                })
                        });
                    });
                } catch (error) {
                    return res.status(400).send({ error: "an error occur please reload you document" });
                    // console.error(`exec error: ${error}`);
                }
            }

            convertPDFToImage();

        } else if (uploadedFile.mimetype.startsWith('image/')) {
            // Handle image file
            let thumbnailPath = path.join(uploadDir1, uploadedFile.name);
            console.log("1-test1")
            thumbnailPath = path.join(uploadDir1, `${path.parse(uploadedFile.name).name}.jpg`);

            await sharp(uploadPath)
                .resize(200) // width of 200px
                .png() // convert to jpeg
                .toFile(thumbnailPath);
            console.log('Thumbnail image created successfully');
            console.log('3');
            student.save()
                .then(data => {
                    return res.status(200).send({ id: student._id, name: `${path.parse(uploadedFile.name).name}.jpg` });
                })
                .catch(err => {
                    console.log(err)
                    return res.status(400).send({ error: "an error occur please reload you document" });
                })
        } else {
            console.log('bad format');
            return res.status(402).send('Invalid file type. Only PDF and image files are allowed.');

        }
    } catch (error) {
        console.log(error)
        return res.status(500).send({ error: 'An error occurred fetching User.' });
    }


}

export const validCandidate = async (req, res) => {
    try {
        // console.log(req.body)
        let concourDate = req.body.candidateDetails.dateOfConcour
        let email = req.body.candidateDetails.email;
        let data = {
            sessionName: req.body.candidateDetails.sessionName,
            field: req.body.candidateDetails.field,
            dateOfConcour: req.body.candidateDetails.dateOfConcour,
            center: req.body.candidateDetails.center,
        }
        let documents = req.body.candidateDocument;
        const student = await Student.findOne({ 'personalInfo.email': email }, {
            _id: 1,
            "academicInfo.concourSessions": 1,
            "documents": 1
        });
        let doc = student.documents;
        console.log(data)
        documents.map((item) => {
            console.log(item)
            if (doc[item.key] !== true) {
                doc[item.key] = item.value;
            }
        })
        student.documents = {}
        student.documents = doc
        student.academicInfo.concourSessions.filter((option) => moment(option.dateOfConcour).format('D MMMM yyyy') === moment(concourDate).format('D MMMM yyyy'))[0].status = 'Accepted';
        console.log(student)
        student.save()
            .then(updateResult => {
                console.log("mail senting 1")
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.SENDER_EMAIL,
                        pass: process.env.EMAIL_PASSWORD,
                    },
                });
                const mailOptions = {
                    from: process.env.SENDER_EMAIL,
                    to: email,
                    subject: 'Candidate Validate',
                    html: mailMessages('candidate-validated', data),
                    // text: `Your verification code is ${verificationCode}`,
                };
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log(error);
                    } else {
                        // console.log('Email sent: ' + info.response);
                        res.status(200).send({ message: "Candidate Accepted Successfully" });
                    }
                });
                console.log("mail sent")
            })
            .catch(err => {
                console.log(err)
                res.status(500).send({ message: 'Please check you connection and try later' });
            })
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: 'Please check you connection and try later' });
    }
}
// Resend Verification code
export const reSendVerificationCode = async (req, res) => {
    console.log(req.params)
    try {
        const email = req.body.email
        console.log(email);
        // find by email in Student model
        const student = await Student.findOne({ 'personalInfo.email': email });

        // find by email in Personnel model
        const personnel = await Personnel.findOne({ 'personalInfo.email': email });

        // Check if neither exists
        if (!student && !personnel) {
            return res.status(401).send({ error: 'Invalid email or password.' });
        }

        // Determine which model has the matching email and then verify password
        let id, modelName, accountType;
        if (personnel) {
            id = student._id;
            modelName = 'Personnel'
            accountType = personnel.personalInfo.accountType
        } else {
            id = student._id;
            modelName = 'Student';
            accountType = student.personalInfo.accountType
        }
        console.log(accountType);
        // Save the verification code and expiry time in the session
        const verificationCode = Math.floor(100000 + Math.random() * 900000); // generates a six-digit number
        console.log(verificationCode)
        const token = jwt.sign({ id, email, modelName, code: verificationCode }, process.env.JWT_TOKEN_KEY, { expiresIn: '30m' });
        // Send the verification code to the user's email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SENDER_EMAIL,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
        let data = {
            accountType,
            verificationCode
        }
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Verification Code',
            html: mailMessages('create-account', data),
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
        req.PersonalInfo = {
            'personalInfo.email': email,
            'token': token,
            'personalInfo.email_verification': false
        }
        const save = await student.updateOne({
            'personalInfo.token': token,
            'personalInfo.email_verification': false
        });
        res.status(200).send({ message: 'Email Resent Successfully' });
        console.log(save)
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Server error.' });
    }
};
