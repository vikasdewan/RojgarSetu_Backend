import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import pkg from "body-parser"
import connectDB from "./db/index.js"
import dotenv from "dotenv"
import http from "http"
import { Server } from "socket.io"
import path from "path"
import { fileURLToPath } from "url"

dotenv.config({
  path: "./.env",
})
const { urlencoded } = pkg

// Get current directory
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const server = http.createServer(app)

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  },
})

app.use(express.json())
app.use(cookieParser())
app.use(urlencoded({ extended: true }))
app.use(express.static("public"))

// Serve static files from temp directory
app.use("/temp", express.static(path.join(__dirname, "temp")))

const corsOptions = {
  allowHeaders: ["Content-Type", "Authorization"],
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  methods: "GET,PUT,POST,DELETE,PATCH",
  credentials: true,
}

app.use(cors(corsOptions))
const port = process.env.PORT || 3000

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id)

  // Join a room based on user ID
  socket.on("join", (userId) => {
    socket.join(userId)
    console.log(`User ${userId} joined their room`)
  })

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id)
  })
})

// Export socket.io instance for use in notification utility
export const socketIO = io

//database connection
connectDB()
  .then(() => {
    server.listen(port, () => {
      console.log(`server is running at http://localhost:${port}`)
    })
  })
  .catch((err) => {
    console.log("Mongo DB connection error :: ", err)
  })

// routes import
import userRouter from "./routes/user.routes.js"
import employerRouter from "./routes/employer.routes.js"
import vehicleOwnerRouter from "./routes/vehicleOwner.routes.js"
import jobRouter from "./routes/job.routes.js"
import applicationRouter from "./routes/application.routes.js"
import vehicleRouter from "./routes/vehicle.routes.js"

// New routes import
import authRoutes from "./routes/auth.routes.js"
import profileRoutes from "./routes/profile.routes.js"
import workerRoutes from "./routes/worker.routes.js"
import contractorRoutes from "./routes/contractor.routes.js"
import ownerRoutes from "./routes/owner.routes.js"
import notificationRoutes from "./routes/notification.routes.js"
import pdfRoutes from "./routes/pdf.routes.js"
import recommendationRoutes from "./routes/recommendation.routes.js"

// Existing routes declaration
app.use("/api/v1/user", userRouter)
app.use("/api/v1/vehicleowner", vehicleOwnerRouter)
app.use("/api/v1/employer", employerRouter)
app.use("/api/v1/vehicle", vehicleRouter)
app.use("/api/v1/job", jobRouter)
app.use("/api/v1/application", applicationRouter)

// New routes declaration
app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/profile", profileRoutes)
app.use("/api/v1/worker", workerRoutes)
app.use("/api/v1/contractor", contractorRoutes)
app.use("/api/v1/owner", ownerRoutes)
app.use("/api/v1/notifications", notificationRoutes)
app.use("/api/v1/pdf", pdfRoutes)
app.use("/api/v1/recommendations", recommendationRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: err.message,
  })
})

export default app

