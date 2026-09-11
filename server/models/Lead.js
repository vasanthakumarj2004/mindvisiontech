import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
    message: { type: String, trim: true },
    status: { type: String, enum: ['new', 'contacted', 'converted'], default: 'new' }
  },
  { timestamps: true }
);

export const Lead = mongoose.model('Lead', leadSchema);