import { PdfMaterial } from '../models/PdfMaterial.js';
import { Subject } from '../models/Subject.js';
import { uploadPdfToS3, deletePdfFromS3 } from '../services/s3Service.js';

export async function listPdfs(req, res) {
  const { subjectId } = req.params;
  const pdfs = await PdfMaterial.find({ subject: subjectId }).sort({ createdAt: -1 });
  res.json({ data: pdfs });
}

export async function uploadPdf(req, res) {
  const { subjectId } = req.params;
  const { title } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: 'No PDF file uploaded' });
  }

  const subject = await Subject.findById(subjectId).populate('course');
  if (!subject) {
    return res.status(404).json({ message: 'Subject not found' });
  }

  const courseSlug = subject.course.slug;
  const subjectSlug = subject.slug;
  const timestamp = Date.now();
  const filename = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
  const s3Key = `pdfs/${courseSlug}/${subjectSlug}/${timestamp}-${filename}`;

  try {
    const s3Url = await uploadPdfToS3(req.file.buffer, s3Key, req.file.mimetype);

    const pdf = await PdfMaterial.create({
      title: title || req.file.originalname,
      url: s3Url,
      s3Key,
      fileSize: req.file.size,
      subject: subjectId,
      uploadedBy: req.admin.id
    });

    res.status(201).json({ data: pdf });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading to S3', error: error.message });
  }
}

export async function updatePdf(req, res) {
  const { subjectId, pdfId } = req.params;
  const { title } = req.body;

  const pdf = await PdfMaterial.findOne({ _id: pdfId, subject: subjectId });
  if (!pdf) return res.status(404).json({ message: 'PDF not found' });

  if (title) {
    pdf.title = title;
  }

  if (req.file) {
    const subject = await Subject.findById(subjectId).populate('course');
    const courseSlug = subject.course.slug;
    const subjectSlug = subject.slug;
    const timestamp = Date.now();
    const filename = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const newS3Key = `pdfs/${courseSlug}/${subjectSlug}/${timestamp}-${filename}`;

    try {
      const s3Url = await uploadPdfToS3(req.file.buffer, newS3Key, req.file.mimetype);
      await deletePdfFromS3(pdf.s3Key); // delete old
      
      pdf.url = s3Url;
      pdf.s3Key = newS3Key;
      pdf.fileSize = req.file.size;
    } catch (error) {
      return res.status(500).json({ message: 'Error replacing PDF in S3', error: error.message });
    }
  }

  await pdf.save();
  res.json({ data: pdf });
}

export async function deletePdf(req, res) {
  const { subjectId, pdfId } = req.params;

  const pdf = await PdfMaterial.findOne({ _id: pdfId, subject: subjectId });
  if (!pdf) {
    return res.status(404).json({ message: 'PDF not found' });
  }

  try {
    await deletePdfFromS3(pdf.s3Key);
    await PdfMaterial.findByIdAndDelete(pdfId);
    res.json({ message: 'PDF deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting PDF', error: error.message });
  }
}
