import Student from '../models/Students.js';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import validator from 'validator';
import jwt from 'jsonwebtoken';
import session from 'express-session';
import { generateString, mailMessages } from "../utils/helper.js";
import { log } from 'console';
let userTokens = {};



// Register a new student

// Create a new student
export const registerStudent = async (req, res) => {
  try {
    const { email, password, passwordConfirmation } = req.body;
    // Email validation
    if (!validator.isEmail(email)) {
      return res.status(400).send({ error: 'Invalid email.' });
    }

    const existingUser = await Student.findOne({ 'personalInfo.email': email });
    if (existingUser) {
      return res.status(400).send({ message: 'Email already in use.' });
    }


    // Password validation
    if (password.length < 8) {
      return res.status(400).send({ error: 'Password must be at least 8 characters.' });
    }

    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      return res.status(400).send({ error: 'Password must contain at least one lowercase letter, one uppercase letter, and one digit.' });
    }
    if (password !== passwordConfirmation) {
      return res.status(400).send({ error: 'Passwords do not match.' });
    }


    // Save the verification code and expiry time in the session
    const verificationCode = Math.floor(100000 + Math.random() * 900000); // generates a six-digit number

    const token = jwt.sign({ email, code: verificationCode }, process.env.JWT_TOKEN_KEY, { expiresIn: '30m' });

    // Store the token on the server
    userTokens[email] = token;

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
      html: mailMessages('create-account', verificationCode),
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

    // Create a new student but don't save yet
    let student = new Student({

    });
    student.personalInfo = {
      email: email,
      password: hashedPassword,
      passwordString: salt,
    }
    const save = await student.save();
    if (save) {
      res.status(200).send({ message: 'A verification code has been sent to your email. Please enter the code to complete registration.' });
    }


  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Server error.' });
  }
};
export const verifyStudent = async (req, res) => {

  // Check if the verification code is correct and not expired
  const { email, verificationCode } = req.body;
  const token = userTokens[email];
  if (!token) {
    return res.status(400).send({ message: 'No verification token found.' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_TOKEN_KEY);
    console.log(decoded);

    if (decoded.code !== parseInt(verificationCode)) {
      return res.status(400).send({ message: 'Invalid verification code.' });
    }
    req.verification = {
      'personalInfo.email_verification': true
    }
    const student = await Student.findOneAndUpdate({ email: token.email }, req.verification, { new: true });
    res.status(201).send({
      student: student,
      message: 'Registration successful.'
    });

  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Server error.' });
  }
};
// Get all students
export const getStudents = async (req, res) => {
  try {
    const students = await Student.find({}, {
      _id: 1,
      name: 1,
      surname: 1,
      'personalInfo.email': 1,
      'academicInfo.field': 1,
      'academicYears.year': 1,
      'academicYears.class': 1
    });
    res.status(201).send({
      students: students,
      message: 'List all student'
    })
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Server error.' });
  }
};
// Get a single student by id
export const getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id,{
      'personalInfo.name':1,
      'personalInfo.surName':1,
      'personalInfo.accountType':1,
      'personalInfo.dateOfBirth':1,
      'personalInfo.phone':1,
      'personalInfo.email':1,
      'personalInfo.nationality':1,
      'personalInfo.region':1,
      'personalInfo.gender':1,
      'personalInfo.address':1,
      'personalInfo.maritalStatus':1,
      'contacts':1,
    });
    res.send({ student });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Server error.' });
  }

};

// Get a single student by matricule
export const getStudentBymatricule = async (req, res) => {
  try {
    const student = await Student.findById(req.params.matricule);
    res.send({ student });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Server error.' });
  }
};

// Create a new student
export const createStudent = async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.status(201).send({ student });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Server error.' });
  }

};


// Update a student by id
export const updateStudent = async (req, res) => {
  const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.send({ student });
};

// Delete a student by id
export const deleteStudent = async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.status(204).send({ message: + req.params.id + "Deleted Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Faile to Delete User" });
  }

};

// Extra functionality: Get students by field of study
export const getStudentsByField = async (req, res) => {
  const students = await Student.find({ 'academicInfo.field': req.params.field });
  res.send({ students });
};
// Resend Verification code
export const reSendVerificationCode = async (req, res) => {
  console.log(req.params)
  try {
    const email = req.params.id
    console.log(email);
    const student = await Student.findOne({ 'personalInfo.email': email });
    // Save the verification code and expiry time in the session
    const id = student._id
    const verificationCode = Math.floor(100000 + Math.random() * 900000); // generates a six-digit number
    const token = jwt.sign({ id, email, code: verificationCode }, process.env.JWT_TOKEN_KEY, { expiresIn: '30m' });
    // Store the token on the server
    userTokens[email] = token;
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
      text: `Your verification code is ${verificationCode}`,
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
// Update personal info of a student by id
export const updateStudentPersonalInfo = async (req, res) => {
  if (req.body.password) {
    password = req.body.password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    req.PersonalInfo = {
      'personalInfo.password': hashedPassword,
      'personalInfo.passwordString': salt
    }
    const student = await Student.findByIdAndUpdate(req.body.id, req.PersonalInfo, { new: true });
  }
  if (req.body.email) {
    const verificationCode = crypto.randomBytes(5).toString('hex');
    const expiryTime = Date.now() + 30 * 60 * 1000; // 30 minutes from now

    // Save the verification code and expiry time in the session
    req.session.verification = {
      code: verificationCode,
      expiryTime: expiryTime,
      email: email
    };

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
      text: `Your verification code is ${verificationCode}`,
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
      'personalInfo.email_verification': false
    }
    const student = await Student.findByIdAndUpdate(req.body.id, req.PersonalInfo, { new: true });
  }

  const student = await Student.findById(req.params.id);
  student.personalInfo = req.body;
  await student.save();
  res.send({ student });
};

// Update academic info of a student by id
export const updateStudentAcademicInfo = async (req, res) => {
  const student = await Student.findById(req.params.id);
  student.academicInfo = req.body;
  await student.save();
  res.send({ student });
};

// Update documents of a student by id
export const updateStudentDocuments = async (req, res) => {
  const student = await Student.findById(req.params.id);
  student.documents = req.body;
  await student.save();
  res.send({ student });
};

// Update contacts of a student by id
export const updateStudentContacts = async (req, res) => {
  const student = await Student.findById(req.params.id);
  student.contacts = req.body;
  await student.save();
  res.send({ student });
};

// Update CAMark of a course for a student by id
export const updateStudentCAMark = async (req, res) => {
  const student = await Student.findById(req.params.id);
  const academicYear = student.academicYears.find(year => year.year == req.params.year);
  const semester = academicYear.semesters.find(semester => semester.name == req.params.semester);
  const module = semester.modules.find(module => module.moduleName == req.params.module);
  const course = module.courses.find(course => course.code == req.params.courseCode);
  course.CAMark.modified.push({
    preMark: course.CAMark.curentMark,
    modMark: req.body.curentMark,
    modifiedBy: req.body.modifiedBy,
    dateModified: new Date()
  });
  course.CAMark.curentMark = req.body.curentMark;
  await student.save();
  res.send({ student });
};

// Update ExamsMark of a course for a student by id
export const updateStudentExamsMark = async (req, res) => {
  const student = await Student.findById(req.params.id);
  const academicYear = student.academicYears.find(year => year.year == req.params.year);
  const semester = academicYear.semesters.find(semester => semester.name == req.params.semester);
  const module = semester.modules.find(module => module.moduleName == req.params.module);
  const course = module.courses.find(course => course.code == req.params.courseCode);
  course.ExamsMark.modified.push({
    preMark: course.ExamsMark.curentMark,
    modMark: req.body.curentMark,
    modifiedBy: req.body.modifiedBy,
    dateModified: new Date()
  });
  course.ExamsMark.curentMark = req.body.curentMark;
  await student.save();
  res.send({ student });
};

// Update ResistMark of a course for a student by id
export const updateStudentResistMark = async (req, res) => {
  const student = await Student.findById(req.params.id);
  const academicYear = student.academicYears.find(year => year.year == req.params.year);
  const semester = academicYear.semesters.find(semester => semester.name == req.params.semester);
  const module = semester.modules.find(module => module.moduleName == req.params.module);
  const course = module.courses.find(course => course.code == req.params.courseCode);
  course.ResistMark.modified.push({
    preMark: course.ResistMark.curentMark,
    modMark: req.body.curentMark,
    modifiedBy: req.body.modifiedBy,
    dateModified: new Date()
  });
  course.ResistMark.curentMark = req.body.curentMark;
  await student.save();
  res.send({ student });
};
// Update Account type to candidate and send a mail to user
export const updateAccountType = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    // console.log(student);
    let name = student.personalInfo.name
    let concour = student.academicInfo.concourSessions
    student.personalInfo.accountType = 'Candidate'
    await student.save()
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
          to: student.personalInfo.email,
          subject: 'Welcome To AICS',
          html: mailMessages('update-Account-Type-Candidate', { name, concour }),
          // text: `Your verification code is ${verificationCode}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
            res.status(201).send({
              message: "Email send successfully"
            })
          }
        });

      })
  }
  catch{
    res.status(401).send({
      message: "An error occurs check you internet connection"
    })
  }
};
export const rejectedAccount = async (req, res) => {
  try{
  const student = await Student.findById(req.params.id);
  console.log(student);
  let name = student.personalInfo.name
  let message = req.body.message
  let urls = req.body.urls
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SENDER_EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const mailOptions = {
    from: process.env.SENDER_EMAIL,
    to: student.personalInfo.email,
    subject: 'Welcome To AICS',
    html: mailMessages('rejected-Account', { name, message, urls }),
    // text: `Your verification code is ${verificationCode}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
      res.status(201).send({
        message: "Email send successfully"
      })
    }
  });
  }
  catch{
    res.status(401).send({
      message: "An error occurs check you internet connection"
    })
  }
};
