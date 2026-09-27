import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true, trim: true },
    duration: { type: String, required: true, trim: true },
    fees: { type: Number, required: true, min: 0 },
    image: { type: String, trim: true },
    branches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Branch' }],
    isActive: { type: Boolean, default: true }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual alias: title <-> name
courseSchema.virtual('title')
  .get(function () {
    return this.name;
  })
  .set(function (v) {
    this.name = v;
  });

// Virtual alias: thumbnailUrl <-> image
courseSchema.virtual('thumbnailUrl')
  .get(function () {
    return this.image;
  })
  .set(function (v) {
    this.image = v;
  });

export const Course = mongoose.model('Course', courseSchema);