import { config } from 'dotenv';
import { cleanEnv, port, str } from 'envalid';
config();

export default cleanEnv(process.env, {
    MONGO_URI: str(),
    PORT: port() ,
	NODE_ENV: str() || 'development',
    FRONTEND_URL: str() || 'http://localhost:5173',
    CLOUDINARY_NAME: str(),
    CLOUDINARY_API_KEY: str(),
    CLOUDINARY_API_SECRET: str(),
    
});

export const ENV_VARS = {
	MONGO_URI: process.env.MONGO_URI,
	PORT: process.env.PORT || 5000,
	NODE_ENV: process.env.NODE_ENV,
	FRONTEND_URL: process.env.FRONTEND_URL,
	CLOUDINARY_NAME: process.env.CLOUDINARY_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
   
	
};
	