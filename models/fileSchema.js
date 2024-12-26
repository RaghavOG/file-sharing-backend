import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  fileType: { type: String, required: true },
  cloudinary_id: { type: String, required: true },
  shortFileId: { type: String, required: true },
}, { timestamps: true });

const File = mongoose.model('File', fileSchema);

export default File;
