import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true,
      select: false
    },
    role: {
      type: String,
      enum: ['superadmin', 'admin'],
      default: 'admin'
    }
  },
  { timestamps: true }
);

// Instance method — never expose hash; compare only
adminSchema.methods.verifyPassword = async function (plaintext) {
  return bcrypt.compare(plaintext, this.passwordHash);
};

// Static helper for creating a hashed admin
adminSchema.statics.hashPassword = async (plaintext) => {
  return bcrypt.hash(plaintext, 10);
};

export const Admin = mongoose.model('Admin', adminSchema);
