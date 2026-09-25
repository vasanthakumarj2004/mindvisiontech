import { InternshipTrack } from '../models/InternshipTrack.js';
import { PdfMaterial } from '../models/PdfMaterial.js';
import { uploadPdfToS3, deletePdfFromS3 } from '../services/s3Service.js';

/**
 * GET /api/admin/internships
 * List all tracks (3-day, 5-day, 12-day).
 */
export async function listTracks(_req, res) {
  const tracks = await InternshipTrack.find().sort({ name: 1 });
  res.json({ data: tracks });
}

/**
 * GET /api/admin/internships/:trackId/pdfs
 * List PDFs for a specific track.
 */
export async function listPdfs(req, res) {
  const track = await InternshipTrack.findById(req.params.trackId);
  if (!track) return res.status(404).json({ message: 'Internship track not found' });

  const pdfs = await PdfMaterial.find({ track: req.params.trackId })
    .populate('uploadedBy', 'email role')
    .sort({ createdAt: -1 });

  res.json({ data: pdfs, track: { _id: track._id, name: track.name, slug: track.slug } });
}

/**
 * POST /api/admin/internships/:trackId/pdfs
 * Upload a new PDF for the track. The file is already in req.file (multer buffer).
 */
export async function uploadPdf(req, res) {
  const track = await InternshipTrack.findById(req.params.trackId);
  if (!track) return res.status(404).json({ message: 'Internship track not found' });

  if (!req.file) return res.status(400).json({ message: 'No PDF file uploaded' });

  const { url, s3Key } = await uploadPdfToS3({
    buffer: req.file.buffer,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    trackSlug: track.slug
  });

  const pdf = await PdfMaterial.create({
    title: req.body.title || req.file.originalname.replace(/\.pdf$/i, ''),
    url,
    s3Key,
    fileSize: req.file.size,
    track: track._id,
    uploadedBy: req.admin.id
  });

  res.status(201).json({ data: pdf });
}

/**
 * PUT /api/admin/internships/:trackId/pdfs/:pdfId
 * Replace an existing PDF: delete old file from S3, upload new one.
 */
export async function replacePdf(req, res) {
  const track = await InternshipTrack.findById(req.params.trackId);
  if (!track) return res.status(404).json({ message: 'Internship track not found' });

  const existing = await PdfMaterial.findOne({
    _id: req.params.pdfId,
    track: req.params.trackId
  });
  if (!existing) return res.status(404).json({ message: 'PDF not found in this track' });

  if (!req.file) return res.status(400).json({ message: 'No replacement PDF file provided' });

  // Delete old file first
  await deletePdfFromS3(existing.s3Key);

  // Upload new file
  const { url, s3Key } = await uploadPdfToS3({
    buffer: req.file.buffer,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    trackSlug: track.slug
  });

  existing.url = url;
  existing.s3Key = s3Key;
  existing.fileSize = req.file.size;
  if (req.body.title) existing.title = req.body.title;
  existing.uploadedBy = req.admin.id;
  await existing.save();

  res.json({ data: existing });
}

/**
 * DELETE /api/admin/internships/:trackId/pdfs/:pdfId
 * Remove PDF from S3 and from the database.
 */
export async function deletePdf(req, res) {
  const pdf = await PdfMaterial.findOne({
    _id: req.params.pdfId,
    track: req.params.trackId
  });
  if (!pdf) return res.status(404).json({ message: 'PDF not found in this track' });

  await deletePdfFromS3(pdf.s3Key);
  await pdf.deleteOne();

  res.json({ message: 'PDF deleted successfully' });
}
