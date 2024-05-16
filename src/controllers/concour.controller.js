import Student from '../models/Students.js';
import Settings from "../models/Settings.js";
import moment from 'moment';
import jwt from "jsonwebtoken";
import Notification from "../models/Notification.js";

export function handleSocketConnectionsConcours(io) {
    io.on('connection', (socket) => {
        // Handle 'updateData' event from clients
        socket.on('updateCandidateMarkBack', async (data) => {
            // socket.emit('updateCandidateMarkFrontError', data);
            try {
                let len = data.subjectMark.modified.length
                const decoded_user_payload = jwt.verify(data.token, process.env.JWT_TOKEN_KEY);
                data.subjectMark.modified[len - 1].modifiedBy = decoded_user_payload.name
                const student = await Student.findById(data.id)
                student.academicInfo.concourSessions.filter((option) => moment(option.dateOfConcour).format('D MMMM yyyy') === moment(data.sessionName).format('D MMMM yyyy'))[0].averageMark = data.averageMark
                student.academicInfo.concourSessions.filter((option) => moment(option.dateOfConcour).format('D MMMM yyyy') === moment(data.sessionName).format('D MMMM yyyy'))[0].finalMark = data.finalMark
                student.academicInfo.concourSessions.filter((option) => moment(option.dateOfConcour).format('D MMMM yyyy') === moment(data.sessionName).format('D MMMM yyyy'))[0].subject[data.index3].subjects[data.index4].subjectMark = data.subjectMark
                student.save()
                    .then((res) => io.emit('updateCandidateMarkFront', data))
                    .catch((err) => socket.emit('updateCandidateMarkFrontError', data));
            } catch (err) {
                socket.emit('updateCandidateMarkFrontError', data);
            }

        });
        socket.on('updatePassedMark', async (data) => {
            console.log('updatePassedMarkBack:', data);
            try {
                let date = new Date(data.dateOfConcour);
                const setting = await Settings.findOne({ 'concourSession.dateOfConcour': date })
                console.log('datasett:', setting.concourSession.filter((option) => moment(option.dateOfConcour).format('D MMMM yyyy') === moment(data.dateOfConcour).format('D MMMM yyyy'))[0].passedMark);

                setting.concourSession.filter((option) => moment(option.dateOfConcour).format('D MMMM yyyy') === moment(data.dateOfConcour).format('D MMMM yyyy'))[0].passedMark = data.passedMark
                setting.save()
                    .then((res) => io.emit('updatePassedMarkFront', data))
                    .catch((err) => console.log(err));
            } catch (err) {

            }
        });
        socket.on('publishedSession', async (data) => {
            try {
                const settings = await Settings.findById('64ce4f216e5d2cf878be1c55')
                
                console.log("in candidate")
                const candidates = await Student.find({ 'academicInfo.concourSessions.dateOfConcour': data.dateOfConcour }, {
                    _id: 1,
                });
                for (let index = 0; index < candidates.length; index++) {
                    const student = await Student.findById(candidates[index]._id);
                    student.personalInfo.accountType = 'Participant'
                    const element = student.academicInfo.concourSessions.filter((option) => moment(option.dateOfConcour).format('D MMMM yyyy') === moment(data.dateOfConcour).format('D MMMM yyyy'))[0].averageMark;
                    if (element >= data.passedMark) {
                        console.log("passed")
                        student.academicInfo.concourSessions.filter((option) => moment(option.dateOfConcour).format('D MMMM yyyy') === moment(data.dateOfConcour).format('D MMMM yyyy'))[0].result = 'Passed'
                    } else if (element >= (data.passedMark * .85)) {
                        console.log("passed with dept")
                        student.academicInfo.concourSessions.filter((option) => moment(option.dateOfConcour).format('D MMMM yyyy') === moment(data.dateOfConcour).format('D MMMM yyyy'))[0].result = 'Waiting List'
                    } else {
                        console.log("failed")
                        student.academicInfo.concourSessions.filter((option) => moment(option.dateOfConcour).format('D MMMM yyyy') === moment(data.dateOfConcour).format('D MMMM yyyy'))[0].result = 'Failed'
                    }
                    await student.save()
                        .then(result => {
                            console.log("index" + index + "sAVE");
                        })
                        .catch(err => console.log(err));
                }
                settings.concourSession.filter((option) => moment(option.dateOfConcour).format('D MMMM yyyy') === moment(data.dateOfConcour).format('D MMMM yyyy'))[0].published = true;
                settings.concourSession.filter((option) => moment(option.dateOfConcour).format('D MMMM yyyy') === moment(data.dateOfConcour).format('D MMMM yyyy'))[0].publishedDate = new Date;
                await settings.save()
                    .then(result => {
                        console.log("settings sAVE");
                    })
                    .catch(err => console.log(err));
                io.emit('publishedSessionFront', data)
            } catch (err) {

            }
        })
        socket.on('submitSession', async (data) => {
            console.log(data)
            try {
                const decoded_user_payload = jwt.verify(data.token, process.env.JWT_TOKEN_KEY);
                const settings = await Settings.findById('64ce4f216e5d2cf878be1c55')
                settings.concourSession.filter((option) => moment(option.dateOfConcour).format('D MMMM yyyy') === moment(data.dateOfConcour).format('D MMMM yyyy'))[0].submitted = true;
                console.log(decoded_user_payload);
                console.log("setting");
                await settings.save()
                    .then(async (result) => {
                        console.log("settings sAVE");
                        const notification = new Notification({
                            sender: decoded_user_payload.id,
                            recipients: ["DAAC_Admin"],
                            type: "ConcourResult",
                            subject: "Concour Result Publishment",
                            body: data.message,
                            sentAt: moment().toISOString(),
                            data: data
                        })
                        await notification.save()
                            .then(results => {
                                console.log("Result notification");
                                io.emit('submitSessionFront', data)
                            })
                            .catch(err => console.log(err));
                    })
                    .catch(err => console.log(err));
            } catch (err) {
                console.log({ message: "Invalid token make sure its not expired" });
            }
        })
        socket.on('unPublishedSession', async (data) => {
            try {
                const settings = await Settings.findById('64ce4f216e5d2cf878be1c55')
                console.log(data)
                settings.concourSession.filter((option) => moment(option.dateOfConcour).format('D MMMM yyyy') === moment(data.dateOfConcour).format('D MMMM yyyy'))[0].published = false;
                settings.concourSession.filter((option) => moment(option.dateOfConcour).format('D MMMM yyyy') === moment(data.dateOfConcour).format('D MMMM yyyy'))[0].submitted = false;
                await settings.save()
                    .then(result => {
                        console.log("settings sAVE");
                        io.emit('unPublishedSessionFront', data)
                    })
                    .catch(err => console.log(err));
            } catch (error) {

            }
        })
        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });
}
export const getConcourPublished = async (req, res) => {
    try {
        const setting = await Settings.findOne()
        let session = setting.concourSession
        let sessionPublishWithinMonth = []
        session.map((item) => {
            if (item.published) {
                let element = moment().diff(moment(item.publishedDate), 'days')
                if (element <= 31) {
                    sessionPublishWithinMonth.push(item)
                }
            }
        })
        const sessionCandidates = []
        console.log(sessionPublishWithinMonth)
        for (let index = 0; index < sessionPublishWithinMonth.length; index++) {
            const candidates = await Student.find({ 'academicInfo.concourSessions.dateOfConcour': sessionPublishWithinMonth[index].dateOfConcour, 'academicInfo.concourSessions.result': { $ne: 'Failed' } }, {
                _id: 1,
                'personalInfo.name': 1,
                'personalInfo.surName': 1,
                'personalInfo.email': 1,
                // 'academicInfo.academicYears': 1,
                'academicInfo.concourSessions.sessionName': 1,
                'academicInfo.concourSessions.field': 1,
                'academicInfo.concourSessions.dateOfConcour': 1,
                // 'academicInfo.concourSessions.subject': 1,
                'academicInfo.concourSessions.averageMark': 1,
                'academicInfo.concourSessions.result': 1,
            });
            const candidatesList = []
            for (let index2 = 0; index2 < candidates.length; index2++) {
                const concour = await candidates[index2].academicInfo.concourSessions.filter((option) => moment(option.dateOfConcour).format('D MMMM yyyy') === moment(sessionPublishWithinMonth[index].dateOfConcour).format('D MMMM yyyy'))[0]
                const student = {
                    name: candidates[index2].personalInfo.name,
                    surName: candidates[index2].personalInfo.surName,
                    email: candidates[index2].personalInfo.email,
                    sessionName: concour.sessionName,
                    field: concour.field,
                    dateOfConcour: concour.dateOfConcour,
                    // averageMark: concour.averageMark,
                    result: concour.result
                }
                candidatesList.push(student);
            }
            sessionCandidates.push(candidatesList);
        }
        return res.status(200).send(sessionCandidates)
    } catch (err) {

    }
}
export const getAllConcourPublishedByYear = async (req, res) => {
    try {
        const setting = await Settings.findOne()
        let session = setting.concourSession
        let sessionByYear = []
        session.map((item) => {
            if (moment(item.dateOfConcour).format('yyyy') === req.params.year) {
                if (item.published)
                    sessionByYear.push(item.dateOfConcour)
            }
        })
        console.log(sessionByYear)
        const sessionCandidates = []
        for (let index = 0; index < sessionByYear.length; index++) {
            console.log(index)
            const candidates = await Student.find({ 'academicInfo.concourSessions.dateOfConcour': sessionByYear[index], 'academicInfo.concourSessions.result': { $ne: 'Failed' } }, {
                _id: 1,
                'personalInfo.name': 1,
                'personalInfo.surName': 1,
                'personalInfo.email': 1,
                'academicInfo.concourSessions.sessionName': 1,
                'academicInfo.concourSessions.field': 1,
                'academicInfo.concourSessions.dateOfConcour': 1,
                'academicInfo.concourSessions.center': 1,
                'academicInfo.concourSessions.averageMark': 1,
                'academicInfo.concourSessions.result': 1,
            });
            console.log(candidates)
            const candidatesList = []
            for (let index2 = 0; index2 < candidates.length; index2++) {
                const concour = await candidates[index2].academicInfo.concourSessions.filter((option) => moment(option.dateOfConcour).format('D MMMM yyyy') === moment(sessionByYear[index]).format('D MMMM yyyy'))[0]
                const student = {
                    name: candidates[index2].personalInfo.name,
                    surName: candidates[index2].personalInfo.surName,
                    email: candidates[index2].personalInfo.email,
                    sessionName: concour.sessionName,
                    field: concour.field,
                    dateOfConcour: concour.dateOfConcour,
                    center: concour.center,
                    // averageMark: concour.averageMark,
                    result: concour.result
                }
                candidatesList.push(student);
            }
            sessionCandidates.push(candidatesList);
        }
        return res.status(200).send({ sessionList: sessionByYear, candidateList: sessionCandidates })
    } catch (err) {
        console.log(err)
    }
}