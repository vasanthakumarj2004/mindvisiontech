import mongoose from 'mongoose';

const pdfMaterialSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    s3Key: { type: String, required: true, trim: true }, // full S3 key, used for deletion
    fileSize: { type: Number, required: true }, // bytes
    track: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InternshipTrack',
      required: true
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true
    }
  },
  { timestamps: true }
);

// Virtual: uploadedAt alias for createdAt (spec-friendly)
pdfMaterialSchema.virtual('uploadedAt').get(function () {
  return this.createdAt;
});

pdfMaterialSchema.set('toJSON', { virtuals: true });

export const PdfMaterial = mongoose.model('PdfMaterial', pdfMaterialSchema);
