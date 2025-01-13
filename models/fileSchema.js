import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  fileType: { type: String, required: true },
  cloudinary_id: { type: String, required: true },
  shortFileId: { type: String, required: true },
  isPasswordProtected: { type: Boolean, default: false },
  password: { type: String },
  expiresAt: { type: Date, required: true, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) , index: { expires: 0 } },
}, { timestamps: true });

const File = mongoose.model('File', fileSchema);

export default File;
