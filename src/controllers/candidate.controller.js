import cand from "../models/Candidates.js"
import nodemailer from "nodemailer"
import * as fs from "fs"
import Student from '../models/Students.js';
import Settings from "../models/Settings.js";
import moment from 'moment';
// import faker from 'faker';
import jwt from "jsonwebtoken";
import Notification from "../models/Notification.js";
import faker from "faker";

// Generate a random boolean value
function generateRandomBoolean() {
    return Math.random() < 0.5;
}

// Generate a random date within a specified range
function generateRandomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Generate a random number within a specified range
function generateRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate a random session object
// function generateRandomSession(begin, end) {
//     const dateOfConcour = generateRandomDate(new Date(begin, 0, 1), new Date(end, 0, 1))
//     const endRegistration = generateRandomDate(new Date(begin, 0, 1), new Date(dateOfConcour))
//     const beginRegistration = generateRandomDate(new Date(begin, 0, 1), new Date(endRegistration))
//     const session = {
//         sessionName: moment(dateOfConcour).format('D MMMM'),
//         field: ["Software_Engineer", "Genie_Logiciel", "System_Reseau"],
//         level: ["one", "two"],
//         dateOfConcour: dateOfConcour,
//         center: ["yaounde", "douala"],
//         passed: true,
//         totalAmount: generateRandomNumber(1000, 5000),
//         beginRegistration: beginRegistration,
//         endRegistration: endRegistration,
//         concourRequirements: ["Al slip", "Birth certificate"],
//         status: generateRandomBoolean(),
//         passedMark: 10,
//         subject: [],
//         published: false,
//         submitted: false

//     };

//     const subjectCount = generateRandomNumber(1, 5);
//     const fieldList = ["maths", "english", "french", "logic", "ICT"]
//     for (let i = 0; i < 5; i++) {
//         const subject = {
//             subjectName: fieldList[i],
//             subjectCoeficient: generateRandomNumber(1, 5),
//             status: generateRandomBoolean(),
//             subjectMark: {
//                 currentMark: generateRandomNumber(10, 20),
//                 modified: []
//             }
//         };

//         session.subject.push(subject);
//     }

//     return session;
// }

// Usage: Generate 10 sample session objects
// export const generateSessions = async (req, res) => {
//     const sampleData = [];
//     await Settings.findOne({})
//         .then(result => {
//             for (let i = 0; i < 1; i++) {
//                 console.log("i", i)
//                 const session = generateRandomSession(2022, 2023);
//                 sampleData.push(session);
//                 // console.log("result", session)
//                 if (result.concourSession.some(e => new Date(e.dateOfConcour).getTime() === session.dateOfConcour.getTime())) {
//                     // Concour with the same date already exists
//                     console.log("already exist");
//                 } else {
//                     result.concourSession.push(session);
//                 }
//             }
//             // console.log("result", result.concourSession)
//             result.save()
//                 .then(result => {
//                     console.log("result");
//                     return res.status(200).send({ message: "Concour Created Successfully" });
//                 })
//                 .catch(err => console.log(err));
//         })
//         .catch(err => console.log("err2"));
//     return res.send(sampleData);
// }
// Generate fake data for the StudentSchema

export const deleteSession = async (req, res) => {
    const candidates = await Student.find({}, {
        _id: 1,
    });
    console.log(candidates.length);
    for (let index = 0; index < candidates.length; index++) {
        console.log(candidates[index]._id);
        const student = await Student.findById(candidates[index]._id);
        student.personalInfo.accountType = 'Participant'
        student.academicInfo.concourSessions = [];
        await student.save()
            .then(result => {
                console.log("index" + index + "sAVE");
            })
            .catch(err => console.log(err));
    }
    res.send("accouts created successfully");
}
export const addSessionToCandidate = async (req, res) => {
    try {
        let concourDate = req.body.date
        console.log(concourDate)
        let concourSessionDetail = {}
        let sessionDetail
        await Settings.findOne({ 'concourSession.dateOfConcour': concourDate })
            .then(result => {
                if (result) {
                    // Find the specific concourSession from the result
                    console.log("here1")
                    concourSessionDetail = result.concourSession.filter((option) => moment(option.dateOfConcour).format('D MMMM yyyy') === moment(concourDate).format('D MMMM yyyy'))[0];
                } else {
                    return res.status(404).send({ message: "This Session is not more valid please take another one2" });
                }
            })
            .catch(err => {
                console.log(err)
                return res.status(404).send({ message: "This Session is not more valid please take another one3" });
            });
        console.log("here2")
        if (concourSessionDetail.status) {
            sessionDetail = {
                sessionName: concourSessionDetail.sessionName,
                field: 'system et reseaux',
                level: 'one',
                dateOfConcour: concourDate,
                center: "IAI CENTER YAOUNDE",
                results: '',
                averageMark: 0,
                status: "Accepted",
                totalAmount: concourSessionDetail.totalAmount,
                payment: {
                    amountPaid: concourSessionDetail.totalAmount,
                    paidDate: new Date(),
                    paymentMethod: "MTN MOMO",
                    receivedBy: "Admin Name",
                },
                subject: concourSessionDetail.subject.filter(subject => subject.status === true)
            }
        } else {
            return res.status(404).send({ message: "This Session is not more valid please take another one1" });
        }
        console.log("here")
        const candidates = await Student.find({}, {
            _id: 1,
        });
        console.log(candidates.length);
        for (let index = 0; index < 8; index++) {
            console.log(candidates[index]._id);
            const student = await Student.findById(candidates[index]._id);
            student.personalInfo.accountType = 'Candidate'
            student.academicInfo.concourSessions.push(sessionDetail);
            let doc = student.documents || {};
            let file1 = "AL Slip"
            let file2 = "CNI"
            let file3 = "Report Card"
            doc[file1] = false;
            doc[file2] = false;
            doc[file3] = false;
            student.documents = {}
            student.documents = doc
            await student.save()
                .then(result => {
                    console.log("index" + index + "sAVE");
                })
                .catch(err => console.log(err));
        }
        res.send("accouts created successfully");
    } catch (err) {
        console.log(err)
        res.send("accouts error");
    }

}
export const generateStudent = async (req, res) => {
    let myConcourSession1 = {}
    let myconcourSession = {}
    // let concourSession = req.body.concourExam
    let date = new Date(req.body.concourDate);
    await Settings.findOne({ 'concourSession.dateOfConcour': date })
        .then(result => {
            if (result) {
                // console.log(result);
                // Find the specific concourSession from the result
                myconcourSession = result.concourSession.find(session => session.dateOfConcour.getTime() === date.getTime());
                // if (myconcourSession.status) {
                myConcourSession1 = {
                    sessionName: myconcourSession.sessionName,
                    dateOfConcour: date,
                    results: false,
                    totalAmount: myconcourSession.totalAmount,
                    payment: {
                        amountPaid: 14500,
                        paidDate: '2024-01-01',
                        paymentMethod: "Credit Card",
                        receiveBy: "Admin Name",
                    },
                    subject: myconcourSession.subject.filter(subject => subject.status === true)
                }
                // }
            } else {
                return res.status(404).json({ message: "Concour Session Not Found" });
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).send({ message: 'Server error.' });
        });
    try {
        console.log("index1");
        for (let index = 0; index < 3; index++) {
            myConcourSession1.field = faker.random.arrayElement(myconcourSession.field)
            myConcourSession1.level = faker.random.arrayElement(myconcourSession.level)
            myConcourSession1.center = faker.random.arrayElement(myconcourSession.center)
            console.log("index" + index);
            // let student = new Student({});
            console.log("index" + index + "test");
            const student = new Student({
                personalInfo: {
                    name: faker.name.firstName(),
                    surName: faker.name.lastName(),
                    accountType: 'Candidate',
                    token: "",
                    status: true,
                    matricule: faker.random.alphaNumeric(8),
                    dateOfBirth: generateRandomDate(new Date(2000, 0, 1), new Date(2005, 0, 1)),
                    gender: faker.random.arrayElement(['Male', 'Female', 'Other']),
                    email: faker.internet.email(),
                    password: '$2b$10$hKa3.dJiZRMko1PBXYKBdunm4Jr/6pnv86jbklLcqRaA8Na7O96eG',
                    passwordString: '$2b$10$hKa3.dJiZRMko1PBXYKBdu',
                    auth: faker.random.arrayElement(['google', 'facebook', 'apple', 'email_and_password']),
                    email_verification: true,
                    phone: faker.phone.phoneNumber(),
                    address: faker.address.streetAddress(),
                    nationality: faker.address.country(),
                    region: faker.address.state(),
                    maritalStatus: faker.random.arrayElement(['Single', 'Married']),
                    createdAt: faker.date.past(),
                    location: {
                        latitude: faker.address.latitude(),
                        longitude: faker.address.longitude(),
                    },
                },
                academicInfo: {
                    concourSessions: myConcourSession1
                },
                documents: {
                    birthCertificate: "birthCertificate",
                    ALSlip: "ALSlip",
                    NID: "NID",
                },
                contacts: {
                    parent: {
                        name: faker.name.firstName(),
                        profession: faker.name.jobTitle(),
                        phone: faker.phone.phoneNumber(),
                        gender: faker.random.arrayElement(['Male', 'Female', 'Other']),
                    },
                    personToContact: {
                        name: faker.name.firstName(),
                        profession: faker.name.jobTitle(),
                        phone: faker.phone.phoneNumber(),
                        gender: faker.random.arrayElement(['Male', 'Female', 'Other']),
                    },
                },
                createdAt: faker.date.past(),
                roles: [
                    {
                        name: faker.random.word(),
                    },
                    {
                        name: faker.random.word(),
                    },
                ],
            });
            console.log("index" + index + "sudent");
            await student.save()
                .then(result => {
                    console.log("index" + index + "sAVE");
                })
                .catch(err => console.log(err));
        }
        res.send("accouts created successfully");
    }
    catch (err) {
        console.log(err);
        res.send("something went wrong");
    }
};

export const registrationMessage = (req, res) => {
    const sender = req.body.senderEmail
    const personalInfo = req.body.candidateDetails
    const message = req.body.message
    if (req.body.urls) {
        var urls = []
        urls = req.body.urls
        var attachments = []
        for (let i = 0; i < urls.length; i++) {
            attachments.push({
                filename: urls[i].doc + ".pdf",
                path: urls[i].url,
                cid: "uniq-" + urls[i].doc + ".pdf"
            })
        }
    }
    let html;
    req.body.urls ?
        html = `<center><div style="background-color: #adf6d7; padding: 10px;">
   <img src="https://ci4.googleusercontent.com/proxy/wzjI4ST1WfMLRoOdBG5ZCAR5oBkC-ammIW6DRVdEfRypkRlulaUlINnyB5832HGMjb_nOTK0fOPYtz49vMdgmlbDax9COgKDEd1yrbS4iK4gZt--0zX_7w=s0-d-e1-ft#http://iaicameroun.com/wp-content/uploads/2018/03/iai-logo-web-ok.png" /><br>
   <h2 style="font-size: 18px;">IAI-CAMEROUN | AICS-CAMEROON</h2>
   <h3 style="">Competitive Entrance Registration Portal</h3>
   <p style=""><b>${personalInfo.First_name} ${personalInfo.Last_name}</b>, Candidate registration failed</p>
  <p style=""> Motive : <b style = "color:red;">${message}</b></p>
  <p>View the files attached to this email </p>
  <a href="http://localhost:3001" style="background-color: dodgerblue; color:white; border-radius:10px; font-weight:700;">Change</a>
  <div style=" margin-top: 5px;">
     <a style="text-decoration: none;" href="#"><img style=" height: 35px;" src="https://cdn-icons-png.flaticon.com/512/3488/3488290.png" /></a>
     &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a style="text-decoration: none;" href="#"><img style=" height: 25px;" src="https://ci4.googleusercontent.com/proxy/UfEI_ysH9BLT_fW_Kxgk7t7rR2c0zavY6czooZvuRomDkbKv-cK_GL_4EeSDm8EnZsci3N9nW-PTUcXCnSD7X1VEkLhm54VunFFAGR7YxjG9Z75tm62FjXxMeHb7k2yytM3nXVA4NLf0LWSiBYw5fRapdUUAV_g=s0-d-e1-ft#https://d3k81ch9hvuctc.cloudfront.net/company/pLHCMh/images/75918f86-4d54-47f7-9e63-c0231bc13396.png"/></a>
     &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a style="text-decoration: none;" href="#"><img style=" height: 25px;" src="https://ci4.googleusercontent.com/proxy/_Ngc2A6Y3qlJ4iH-87wSLKwHTMY6CrESvFiCTciDcYNhaxqs7G7DbTpoLVPMISNt2qApf9bkw_rfNT_XjH_iHM3QubLISqd32wQp_RzNHijA23SovBbwMnYlGNLi2TRe2jbRMFXFsgMzs1T1P_0EtSgSwmTzMAU=s0-d-e1-ft#https://d3k81ch9hvuctc.cloudfront.net/company/pLHCMh/images/aeed5956-20cd-45b0-a29c-19a4bf32087b.png"/></a>
  </div>
</div></center>` :
        html = `<center><div style="background-color: #adf6d7; padding: 10px;">
<img src="https://ci4.googleusercontent.com/proxy/wzjI4ST1WfMLRoOdBG5ZCAR5oBkC-ammIW6DRVdEfRypkRlulaUlINnyB5832HGMjb_nOTK0fOPYtz49vMdgmlbDax9COgKDEd1yrbS4iK4gZt--0zX_7w=s0-d-e1-ft#http://iaicameroun.com/wp-content/uploads/2018/03/iai-logo-web-ok.png" /><br>
<h2 style="font-size: 18px;">IAI-CAMEROUN | AICS-CAMEROON</h2>
<h3 style="">Competitive Entrance Registration Portal</h3>
<p style=""><b>${personalInfo.First_name} ${personalInfo.Last_name}</b>, Registration successful</p>
<div style=" margin-top: 5px;">
  <a style="text-decoration: none;" href="#"><img style=" height: 35px;" src="https://cdn-icons-png.flaticon.com/512/3488/3488290.png" /></a>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a style="text-decoration: none;" href="#"><img style=" height: 25px;" src="https://ci4.googleusercontent.com/proxy/UfEI_ysH9BLT_fW_Kxgk7t7rR2c0zavY6czooZvuRomDkbKv-cK_GL_4EeSDm8EnZsci3N9nW-PTUcXCnSD7X1VEkLhm54VunFFAGR7YxjG9Z75tm62FjXxMeHb7k2yytM3nXVA4NLf0LWSiBYw5fRapdUUAV_g=s0-d-e1-ft#https://d3k81ch9hvuctc.cloudfront.net/company/pLHCMh/images/75918f86-4d54-47f7-9e63-c0231bc13396.png"/></a>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a style="text-decoration: none;" href="#"><img style=" height: 25px;" src="https://ci4.googleusercontent.com/proxy/_Ngc2A6Y3qlJ4iH-87wSLKwHTMY6CrESvFiCTciDcYNhaxqs7G7DbTpoLVPMISNt2qApf9bkw_rfNT_XjH_iHM3QubLISqd32wQp_RzNHijA23SovBbwMnYlGNLi2TRe2jbRMFXFsgMzs1T1P_0EtSgSwmTzMAU=s0-d-e1-ft#https://d3k81ch9hvuctc.cloudfront.net/company/pLHCMh/images/aeed5956-20cd-45b0-a29c-19a4bf32087b.png"/></a>
</div>
</div></center>`
    let mailTransporter = nodemailer.createTransport({
        service: 'gmail',
        secure: false,
        port: 25,
        auth: {
            user: 'chriskameni25@gmail.com',
            pass: 'pvpvqsoyriyhuqxm'
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    let mailDetails = {
        from: sender,
        to: personalInfo.Email,
        subject: 'donotreply Concour registration IAI',
        html: html,
        attachments: req.body.urls != null ? attachments : null
    };

    mailTransporter.sendMail(mailDetails, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            cand.findOne({ Email: personalInfo.Email })
                .then(candidate => {
                    req.body.urls == null ? (candidate.Candidate_status = "APPROVED") : (candidate.Candidate_status = "REJECTED")
                    candidate.save()
                })
            return res.status(200).json({ message: "Email sent successfully" })
        }
    });
}

// export const getAllCandidates = async (req, res) => {
//     try {
//         const candidates = await Student.find({ 'personalInfo.accountType': "Candidate" }, {
//             _id: 1,
//             'personalInfo.name': 1,
//             'personalInfo.surName': 1,
//             'personalInfo.email': 1,
//             'personalInfo.nationality': 1,
//             'academicInfo.concourSessions.sessionName': 1,
//             'academicInfo.concourSessions.field': 1,
//             'academicInfo.concourSessions.dateOfConcour': 1,
//             'academicInfo.concourSessions.center': 1,
//         });
//         res.status(201).send({
//             candidates: candidates,
//             message: 'List all student'
//         })
//     } catch (error) {
//         console.error(error);
//         res.status(500).send({ message: 'Server error.' });
//     }
// };
export const getAllCandidates = async (req, res) => {
    try {
        const allCandidates = await Student.find({ 'personalInfo.accountType': "Candidate" }, {
            _id: 1,
            'personalInfo.name': 1,
            'personalInfo.surName': 1,
            'personalInfo.email': 1,
            'personalInfo.nationality': 1,
            'personalInfo.dateOfBirth': 1,
            'personalInfo.gender': 1,
            'personalInfo.email': 1,
            'personalInfo.phone': 1,
            'personalInfo.address': 1,
            'personalInfo.nationality': 1,
            'personalInfo.region': 1,
            'personalInfo.maritalStatus': 1,
            'academicInfo.concourSessions.sessionName': 1,
            'academicInfo.concourSessions.field': 1,
            'academicInfo.concourSessions.dateOfConcour': 1,
            'academicInfo.concourSessions.center': 1,
            'academicInfo.concourSessions.status': 1,
            'academicInfo.concourSessions.result': 1,
            'academicInfo.concourSessions.payment': 1,
            'documents': 1,
        });
        let candidateList = []
        for (let index = 0; index < allCandidates.length; index++) {
            allCandidates[index].academicInfo.concourSessions.map((item) => {
                if (!item.result) {
                    let payment = item.payment[0] || { paidDate: '' };
                    let candidateInfo = {
                        _id: allCandidates[index]._id,
                        name: allCandidates[index].personalInfo.name,
                        surName: allCandidates[index].personalInfo.surName,
                        email: allCandidates[index].personalInfo.email,
                        nationality: allCandidates[index].personalInfo.nationality,
                        dateOfBirth: allCandidates[index].personalInfo.dateOfBirth,
                        gender: allCandidates[index].personalInfo.gender,
                        phone: allCandidates[index].personalInfo.phone,
                        address: allCandidates[index].personalInfo.address,
                        region: allCandidates[index].personalInfo.region,
                        maritalStatus: allCandidates[index].personalInfo.maritalStatus,
                        sessionName: item.sessionName,
                        field: item.field,
                        dateOfConcour: item.dateOfConcour,
                        registedDate: moment(payment.paidDate).format('dd D/MM/YYYY HH:MM') || '',
                        center: item.center,
                        status: item.status,
                        documents: allCandidates[index].documents,
                    }
                    candidateList.push(candidateInfo)
                }
            })
        }
        res.status(201).send({
            candidates: candidateList,
            message: 'List all student'
        })
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Server error.' });
    }
};
export const getAllConcourByYear = async (req, res) => {
    console.log(req.params.year);
    try {
        let canLength = ''
        const candidates = await Settings.findById('64ce4f216e5d2cf878be1c55')
        // console.log(candidates);
        let session = candidates.concourSession
        let sessionByYear = []
        session.map((item) => {
            if (moment(item.dateOfConcour).format('yyyy') === req.params.year) {
                sessionByYear.push(item)
            }
        })
        let sessionByYearCandidates = []
        for (let index = 0; index < sessionByYear.length; index++) {
            const candidates = await Student.find({ 'academicInfo.concourSessions.dateOfConcour': sessionByYear[index].dateOfConcour }, {
                _id: 1,
                'personalInfo.name': 1,
                'personalInfo.surName': 1,
                'personalInfo.email': 1,
                'academicInfo.academicYears': 1,
                'academicInfo.concourSessions.sessionName': 1,
                'academicInfo.concourSessions.field': 1,
                'academicInfo.concourSessions.dateOfConcour': 1,
                'academicInfo.concourSessions.subject': 1,
                'academicInfo.concourSessions.averageMark': 1,
                'academicInfo.concourSessions.finalMark': 1,
                'academicInfo.concourSessions.result': 1,
            });
            sessionByYearCandidates.push(candidates);
        }
        res.status(201).send({
            candidates: sessionByYear,
            candidatesDetail: sessionByYearCandidates,
            message: 'List all student'
        })
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Server error.' });
    }
};
export const getAllCandidatesBySession = async (req, res) => {
    try {
        const candidates = await Student.find({ 'academicInfo.concourSessions.sessionName': "June 22" }, {
            _id: 1,
            'personalInfo.name': 1,
            'personalInfo.surName': 1,
            'personalInfo.email': 1,
            'personalInfo.nationality': 1,
            'academicInfo.concourSessions.sessionName': 1,
            'academicInfo.concourSessions.field': 1,
            'academicInfo.concourSessions.dateOfConcour': 1,
            'academicInfo.concourSessions.center': 1,
            'academicInfo.concourSessions.subject': 1,
        });
        res.status(201).send({
            candidates: candidates,
            message: 'List all student'
        })
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Server error.' });
    }
};
export const addCandidateFiles = (req, res) => {
    const docs = req.files
    const applicantInfo = JSON.parse(req.body.applicantInfo)
    const examInfo = JSON.parse(req.body.examInfo)
    var currentDir = process.cwd()
    var uploadDir, uploadPath
    cand.findOne({ First_name: applicantInfo.fname, Last_name: applicantInfo.lname, Email: applicantInfo.email })
        .then(candidate => {
            if (candidate != null) {
                uploadDir = currentDir + "\\Scolarite\\Applicant_Documents\\" + examInfo.session + "\\" + examInfo.level + "\\" + candidate._id.toString()
                uploadPath = uploadDir + "\\"
                if (!fs.existsSync(uploadDir))
                    fs.mkdirSync(uploadDir, { recursive: true })
                if (docs.birthCertificate) {
                    if (candidate.Birth_Certificate != null)
                        candidate.Candidate_status = "MODIFIED"
                    candidate.Birth_Certificate = uploadPath + "birth certificate.pdf"
                    candidate.save()
                    docs.birthCertificate.mv(uploadPath + "birth certificate.pdf", (error) => {
                        if (error) throw error
                    })
                }
                else if (docs.slip) {
                    if (candidate.Al_slip != null)
                        candidate.Candidate_status = "MODIFIED"
                    candidate.Al_slip = uploadPath + "slip.pdf"
                    candidate.save()
                    docs.slip.mv(uploadPath + "slip.pdf", (error) => {
                        if (error) throw error
                    })
                }

                else if (docs.idcard) {
                    if (candidate.Id_card != null)
                        candidate.Candidate_status = "MODIFIED"
                    candidate.Id_card = uploadPath + "id card.pdf"
                    candidate.save()
                    docs.idcard.mv(uploadPath + "id card.pdf", (error) => {
                        if (error) throw error
                    })
                }
                return res.status(200)
            }
        }).catch(err => console.error(err))
}

