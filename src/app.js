import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pkg from "body-parser";

const { urlencoded } = pkg;

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));

const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true,
};
app.use(cors(corsOptions));

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
