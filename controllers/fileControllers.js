import { CloudinaryUpload } from '../services/cloudinary.js';
import File from '../models/fileSchema.js';
import envVars from '../config/envVars.js';
import shortid from 'shortid';
import { url } from 'envalid';

export const uploadFile = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ success: false, message: "No file uploaded" });

    const { originalname, mimetype } = file;

    console.log(originalname, mimetype);        

    // Upload the file to Cloudinary
    const { secure_url, public_id } = await CloudinaryUpload(file, 'uploads', originalname);

    console.log(secure_url, public_id);

const shortFileId = Math.floor(Math.random() * 9000) + 1000;


    console.log(shortFileId);

    // Save file details to the database
    const newFile = new File({
      fileName: originalname,
      filePath: secure_url,
      fileType: mimetype,
      cloudinary_id: public_id,
      shortFileId,
    });
    
    await newFile.save();

    console.log(`${envVars.FRONTEND_URL}/download/${shortFileId}`)

    // Respond with the file id and download URL
    res.status(200).json({
      success: true,
      file: newFile,
      downloadUrl: secure_url,
      shortFileId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const downloadFile = async (req, res) => {
  try {
      const { id } = req.body;

      if (!id) {
          return res.status(400).json({ success: false, message: 'File ID is missing in request' });
      }

      console.log("File ID from request:", id);

      const file = await File.findOne({ shortFileId: id });

      if (!file) {
          return res.status(404).json({ success: false, message: 'File not found' });
      }


      // Redirect to the Cloudinary secure URL to trigger the file download
      res.json({
          success: true,
          url: file.filePath
      });
  } catch (error) {
      console.error('Error downloading file:', error);
      res.status(500).json({ success: false, message: error.message });
  }
};
