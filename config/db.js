import mongoose from "mongoose";
import { ENV_VARS } from "./envVars.js";
import chalk from "chalk";

export const connectDB = async () => {
	try {
		const conn = await mongoose.connect(ENV_VARS.MONGO_URI);
		console.log(chalk.bgMagenta("MongoDB connected: Successfully "));
	} catch (error) {
		console.error("Error connecting to MONGODB: " + error.message);
		process.exit(1); 
	}
};