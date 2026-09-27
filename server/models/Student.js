import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    courseFees: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    finalFees: { type: Number, min: 0 },
    enrolledAt: { type: Date, default: Date.now }
  },
  {
    timestamps: true
  }
);

studentSchema.pre('save', function (next) {
  this.finalFees = Math.max(0, this.courseFees - (this.discount || 0));
  next();
});

export const Student = mongoose.model('Student', studentSchema);
