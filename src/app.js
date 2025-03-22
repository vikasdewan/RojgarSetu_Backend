import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pkg from "body-parser";
import connectDB from "./db";

const { urlencoded } = pkg;

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));
app.use(express.static("public"));

const corsOptions = {
    allowHeaders:["Content-Type"],
    origin: 'http://localhost:5173',
    methods:"GET,PUT,POST,DELETE,PATCH",
    credentials: true,
};

app.use(cors(corsOptions));
const port = process.env.PORT || 3000;
//database connection 
connectDB()
.then(()=>{
    app.listen(port,()=>{
       console.log(`server is running at http://localhost:${port}`);
    })
})
.catch((err)=>{
    console.log("Mongo DB connection error :: ",err);
    
})

// routes import 
import userRouter from './routes/user.routes.js';
import employerRouter from './routes/employer.routes.js'
import vehicleOwnerRouter from './routes/vehicleOwner.routes.js'
import jobRouter from './routes/job.routes.js'
import applicationRouter from './routes/application.routes.js'
import vehicleRouter from './routes/vehicle.routes.js'


//routes declaration 
app.use('/api/v1/user',userRouter)
app.use('/api/v1/vehicleowner',vehicleOwnerRouter)
app.use('/api/v1/employer',employerRouter)
app.use('/api/v1/vehicle',vehicleRouter)
app.use('/api/v1/job',jobRouter)
app.use('/api/v1/application',applicationRouter)