import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import chalk from 'chalk';

import upload from "./middleware/multer.js";

import { ENV_VARS } from "./config/envVars.js";
import { connectDB } from "./config/db.js";
import { checkFileStatus,  getDownloadUrl,  uploadFile } from "./controllers/fileControllers.js";

const app = express();

// Enable CORS
app.use(cors({
    origin: ENV_VARS.FRONTEND_URL, // Specify your frontend URL
    credentials: true
}));

// Logging in development
if (ENV_VARS.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

const PORT = ENV_VARS.PORT;
const __dirname = path.resolve();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());

// Routes
app.use("/api/v1/upload", upload.single("file"),uploadFile);
app.use("/api/v1/files/:id", checkFileStatus);
app.use("/api/v1/download",getDownloadUrl );

// Health check route
app.get("/", (req, res) => {
    res.status(200).json({ success: true, message: 'Server is up and running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || "Server Error",
        stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
});

// Serve static files in production
if (ENV_VARS.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "/frontend/dist")));
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
    });
}

app.listen(PORT, () => {
    console.log(chalk.bgWhite('Server started at http://localhost:' + PORT));
    console.log(chalk.bgYellow.blue('Frontend started at ' + ENV_VARS.FRONTEND_URL));
    connectDB().catch(err => {
        console.error(chalk.bgRed.white('Database connection failed:'), err);
    });
});
