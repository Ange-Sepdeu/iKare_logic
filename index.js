import express from 'express'
import mongoose from 'mongoose'
import http from 'http'
import { Server } from 'socket.io';
import cors from 'cors';
// import authRoutes from "./routes/auth.routes.js";
// import userRoutes from "./routes/user.routes.js";
import {config} from "./config/db_config.js";
import dotenv from 'dotenv-flow';
dotenv.config({ path: 'local.env' });
import bodyParser from 'body-parser';

//const url = process.env.MONGODB_URI || `mongodb://${config.dbhost}:${config.dbport}/${config.dbname}`;
const url = process.env.MONGODB_URI;
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

app.use(cors())
app.use(express.json());
app.use(bodyParser.json());
connectWithRetry();;

app.get("/", (req, res) => {
    res.send("<center><h1 style='margin-top: 20%;color:#0d7dd6;'>WELCOME TO CIDRA</h1><h2 style='color:#0d7dd6;'>BACKEND API</h2></center>")
});

// app.use("/api/auth", authRoutes)
// app.use("/api/user", userRoutes)

app.get("*", (req, res)=>{
    res.status(404).json({message:`Route ${req.path} not found`})
})


export const serverInstance = server.listen(process.env.PORT, (err) => {
    console.log("Server running on port", process.env.PORT)
})

export default app;