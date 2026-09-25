import mongoose from 'mongoose';

const internshipTrackSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, trim: true, default: '' }
  },
  { timestamps: true }
);

export const InternshipTrack = mongoose.model('InternshipTrack', internshipTrackSchema);
