import { v2 as Cloudinary } from "cloudinary";
import fs from "fs/promises";
import os from "os";
import path from "path";
import {ENV_VARS} from '../config/envVars.js';

Cloudinary.config({
  cloud_name: ENV_VARS.CLOUDINARY_NAME,
  api_key: ENV_VARS.CLOUDINARY_API_KEY,
  api_secret: ENV_VARS.CLOUDINARY_API_SECRET,
});

async function CloudinaryUpload(file, folder,filename) {
  try {
    if (!file) throw new Error("No file provided");

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      throw new Error("File size exceeds the 25MB limit");
    }

    // === Allowed MIME Types ===
    const ALLOWED_TYPES = ["image/jpeg", "image/png", "video/mp4", "application/pdf"];
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      throw new Error("Invalid file type. Only JPEG, PNG, MP4, and PDF are allowed");
    }

    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, file.originalname);  

    const buffer = Buffer.from(await file.buffer);
    await fs.writeFile(tempFilePath, buffer);

    const mimeType = file.mimetype;
    
    let resourceType = "auto";

    if (mimeType.startsWith("image/")) {
      resourceType = "image";
    } else if (mimeType.startsWith("video/")) {
      resourceType = "video";
    } else if (mimeType === "application/pdf") {
      resourceType = "raw";
    }

    // Upload the file to Cloudinary
    const response = await Cloudinary.uploader.upload(tempFilePath, {
      resource_type: resourceType,
      flags: "attachment", 
      folder: folder,
      public_id: filename,  
      access_mode: "public",  
    });


    await fs.unlink(tempFilePath);

    return response;
  } catch (error) {
    console.error("Error during Cloudinary upload:", error);
    throw error;
  }
}

export { CloudinaryUpload };