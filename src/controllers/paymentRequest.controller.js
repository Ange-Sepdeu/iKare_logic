import Joi from '@hapi/joi';
import { serverio } from '../../index.js';
import PaymentRequest from "../models/PaymentRequest.js";
import Student from '../models/Students.js';
import moment from 'moment'
import jwt from 'jsonwebtoken'

export const getPaymentRequestNotValidated = async (req, res) => {
    const paymentRequest = await PaymentRequest.find({ 'validated.status': false });
    res.status(200).send(paymentRequest);
};
export const getAllPaymentRequest = async (req, res) => {
    const paymentRequest = await PaymentRequest.find();
    res.status(200).send(paymentRequest);
};
export const createPaymentRequest = async (req, res) => {
    console.log(req.body)
    const paymentRequestSchema = Joi.object({
        name: Joi.string().required(),
        id: Joi.string().required(),
        field: Joi.string().required(),
        email: Joi.string().required(),
        type: Joi.string().required(),
        kind: Joi.string().required(),
        year: Joi.string().required(),
        amount: Joi.number().required(),
        penality: Joi.number().required(),
        duration: Joi.number().required(),
        beginPenality: Joi.date().required(),
    });
    const paymentRequest = {
        id: req.body.id,
        name: req.body.name,
        field: req.body.field,
        email: req.body.email,
        type: req.body.type,
        kind: req.body.kind,
        year: req.body.year,
        amount: req.body.amount,
        penality: req.body.penality,
        duration: req.body.duration,
        beginPenality: new Date(req.body.beginPenality),
    }
    console.log(paymentRequest);
    const { error } = paymentRequestSchema.validate(paymentRequest);
    if (error)
        return res.status(500).send(error);
    const paymentrequest = new PaymentRequest(paymentRequest)
    paymentrequest.save()
        .then((result) => {
            serverio.emit('paymentRequestFront', paymentrequest)
            return res.status(200).send(paymentrequest);
        })
        .catch((err) => console.log(err))
};
export const validatePaymentRequest = async (req, res) => {
    const paymentrequest = await PaymentRequest.findById(req.body._id);
    console.log(paymentrequest)
    if (!paymentrequest.validated.status) {
        try {
            let token = req.body.token || req.query.token || req.headers["x-access-token"];
            const decoded_user_payload = jwt.verify(token, process.env.JWT_TOKEN_KEY);
            console.log(decoded_user_payload);
            const student = await Student.findById(paymentrequest.id, {
                'academicInfo.academicYears': 1
            });
            let AcademicYear = {
                year: paymentrequest.year,
            }
            let existingAcademicYear = await student.academicInfo.academicYears.filter((option) => option.year === paymentrequest.year);
            if (existingAcademicYear.length === 0)
                student.academicInfo.academicYears.push(AcademicYear)
            if (paymentrequest.kind === 'PreRegistration') {
                let registration = {
                    amount: paymentrequest.amount,
                    penality: paymentrequest.penality,
                    paidDate: new Date(),
                    paymentMethod: 'In Cash',
                    receivedBy: decoded_user_payload.id
                }
                student.academicInfo.academicYears.filter((option) => option.year === paymentrequest.year)[0].registration = registration;
                existingAcademicYear = await student.academicInfo.academicYears.filter((option) => option.year === paymentrequest.year);
                student.save()
                    .then((result) => {
                        paymentrequest.validated.status = true;
                        paymentrequest.validated.On = new Date();
                        paymentrequest.validated.By = {
                            name: decoded_user_payload.name,
                            id: decoded_user_payload.id,
                        };
                        paymentrequest.save()
                            .then((result) => {
                                serverio.emit('paymentRequestValidatedFront', student)
                                return res.status(200).send(student);
                            })
                            .catch((err) => console.log(err))
                    })
                    .catch((err) => console.log(err))
                // return res.send(existingAcademicYear)
            } else {
                // console.log("err")
                return res.send({ message: "Access Denied." })
            }
        } catch (err) {
            // console.log(err)
            return res.send({ message: "Access Denied." })
        }
    } else {
        return res.send({ message: "request validated" })
    }
    // if()
}

export function handleSocketConnectionsPaymentRequest(io) {
    io.on('connection', (socket) => {
        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });
}
