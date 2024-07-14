import express from 'express'
import mongoose from 'mongoose'
import http from 'http'
import { Server } from 'socket.io';
import fileUpload from 'express-fileupload'
import cors from 'cors';
import authRoutes from "./src/routes/auth.routes.js";
import userRoutes from "./src/routes/user.routes.js";
import * as hospitalService from "./src/services/hospital.service.js"
import userSchema from './src/models/user.model.js';
import hospitalRoutes from "./src/routes/hospital.routes.js";
import roleRoutes from "./src/routes/role.routes.js";
import {config} from "./src/config/db.config.js";
import dotenv from 'dotenv-flow';
dotenv.config({ path: 'local.env' });
import bodyParser from 'body-parser';

const url = `mongodb://${config.dbhost}:${config.dbport}/${config.dbname}`;
//const url = process.env.MONGODB_URI;
let retries = 15;

const connectWithRetry = () => {
    mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => {
            console.log('MongoDB connected');
        })
        .catch((err) => {
            console.error('Failed to connect to MongoDB', err);
            if (retries > 0) {
                retries -= 1;
                console.log(`Retries left: ${retries}`);
                setTimeout(connectWithRetry, 5000);
            } else {
                console.error('Max retries reached');
            }
        });
};

const app = express()
const server = http.createServer(app)
export const serverio = new Server(server, {
    maxHttpBufferSize: 1e8,
    cors: {
        origin: "*",
        methods: ["GET", "POST", "DELETE", "PATCH", "PUT"]
    }
});


async function getAndSaveObject(id, data) {
    const hospitals = await hospitalService.getAllHospitals()
    var userObject = null
    var selectedHospital
    for (let hospital of hospitals) {
        selectedHospital = hospital
        userObject = hospital.doctors.find(doc => doc._id==id)
    }
    if (!userObject)
    {
        userObject = await userSchema.findById(id)
        userObject.notifications.push(data)
        userObject.save()
    }
    else{
        userObject.notifications.push(data) 
       await selectedHospital.save()
    }
    return userObject
}

// serverio.use((socket, next) => {
//     const sessionID = socket.handshake.auth.sessionID
//     if (sessionID) {
//         const session = session
//     }
// })

serverio.on('connection', (socket) => {
    socket.on("send-id", async(data) => {
        console.log("Connected user: ", socket.id, data.fullname)
        if (data.userRole=="PATIENT") {
            const updated = await userSchema.findByIdAndUpdate(data._id, {socket:socket.id})
        }
        else if (data.userRole == "DOCTOR") {
            const hospital = await hospitalService.getHospitalById(data.hospital_id);
            hospital.doctors.forEach(doctor => {
                if (doctor._id == data._id){
                    doctor.socket = socket.id
                }
            })
            const saved = await hospital.save()
        }
    })
    socket.on("send-message", async(data) => {
        const sender = data?.sender
        const receiver = data?.receiver
        const message = data?.message
        const time = data?.time
        try {
            const receiverObject = await getAndSaveObject(receiver, {...data, date: new Date(time)})
            const receiverSocketId = receiverObject.socket
            console.log("Receiver Socket Id", receiverSocketId, "message: ", message)
            // serverio.to(receiverSocketId).emit("private-message", {sender, message, time})
            serverio.emit("private-message", {sender, message, time})
            const senderObject = await getAndSaveObject(sender, {...data, date: new Date(time)});
            console.log("Success !")
        }
        catch(error) {console.log(error)}    
    })
})

app.use(cors())
app.use(express.json());
app.use(bodyParser.json());
app.use(fileUpload())
connectWithRetry();

app.get("/", (req, res) => {
    res.send("<center><h1 style='margin-top: 20%;color:#0d7dd6;'>WELCOME TO CIDRA</h1><h2 style='color:#0d7dd6;'>BACKEND API</h2></center>")
});

app.use("/api/auth", authRoutes)
app.use("/api/user", userRoutes)
app.use("/api/role", roleRoutes);
app.use("/api/hospital", hospitalRoutes);

app.get("*", (req, res)=>{
    res.status(404).json({message:`Route ${req.path} not found`})
})


export const serverInstance = server.listen(process.env.PORT, (err) => {
    console.log("Server running on port", process.env.PORT)
})

export default app;