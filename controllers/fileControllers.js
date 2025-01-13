import { CloudinaryUpload } from '../services/cloudinary.js';
import File from '../models/fileSchema.js';
import bcrypt from 'bcryptjs';

export const uploadFile = async (req, res) => {
  try {
    const file = req.file;
    const { password } = req.body;

    if (!file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const { originalname, mimetype, size } = file;

    // Add file size validation
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (size > MAX_FILE_SIZE) {
      return res.status(413).json({ success: false, message: "File size exceeds 100MB limit" });
    }

    // Upload the file to Cloudinary
    const { secure_url, public_id } = await CloudinaryUpload(file, 'uploads', originalname);

    // Generate a more secure random ID (8 characters)
    const shortFileId = Math.random().toString(36).substring(2, 10);

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    let isPasswordProtected = false;
    let hashedPassword = null;

    if (password) {
      isPasswordProtected = true;
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    const newFile = new File({
      fileName: originalname,
      filePath: secure_url,
      fileType: mimetype,
      cloudinary_id: public_id,
      shortFileId,
      expiresAt,
      isPasswordProtected,
      password: hashedPassword,
    });

    await newFile.save();

    res.status(200).json({
      success: true,
      message: isPasswordProtected ? "File uploaded with password protection." : "File uploaded successfully.",
      shortFileId,
      expiresAt,
      isPasswordProtected
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Route to check file status and protection
export const checkFileStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const file = await File.findOne({ shortFileId: id });

    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found or expired' });
    }

    if (new Date() > file.expiresAt) {
      return res.status(410).json({ success: false, message: 'File has expired' });
    }

    // Return only necessary information
    res.status(200).json({
      success: true,
      fileName: file.fileName,
      isPasswordProtected: file.isPasswordProtected,
      expiresAt: file.expiresAt
    });
  } catch (error) {
    console.error('Error checking file status:', error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Route to get download URL (requires password if protected)
export const getDownloadUrl = async (req, res) => {
  try {
    const { id, password } = req.body;

    const file = await File.findOne({ shortFileId: id });

    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found or expired' });
    }

    if (new Date() > file.expiresAt) {
      return res.status(410).json({ success: false, message: 'File has expired' });
    }

    if (file.isPasswordProtected) {
      if (!password) {
        return res.status(401).json({ success: false, message: 'Password required' });
      }

      const isMatch = await bcrypt.compare(password, file.password);
      if (!isMatch) {
        return res.status(403).json({ success: false, message: 'Incorrect password' });
      }
    }

    res.status(200).json({
      success: true,
      url: file.filePath,
      fileName: file.fileName
    });
  } catch (error) {
    console.error('Error getting download URL:', error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};