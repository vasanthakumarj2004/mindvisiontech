import mongoose from 'mongoose';

const branchSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    coordinates: { lat: Number, lng: Number },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Branch = mongoose.model('Branch', branchSchema);