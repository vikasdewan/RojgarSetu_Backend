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


app.get("/", (req, res) => {
    return res.status(200).json({
        message: "rojgarsetu backend",
        success: true,
    });
});

const PORT = 8000;

app.listen(PORT, () =>  { 
    console.log(`Server listening at port ${PORT}`);
});
