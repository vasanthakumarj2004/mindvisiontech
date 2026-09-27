import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    order: { type: Number, default: 0 }
  },
  {
    timestamps: true
  }
);

export const Subject = mongoose.model('Subject', subjectSchema);
