import { Subject } from '../models/Subject.js';
import { Course } from '../models/Course.js';
import { PdfMaterial } from '../models/PdfMaterial.js';
import { deletePdfFromS3 } from '../services/s3Service.js';

export async function listSubjects(req, res) {
  const { courseId } = req.params;
  const subjects = await Subject.find({ course: courseId }).sort({ order: 1, createdAt: -1 });
  res.json({ data: subjects });
}

export async function createSubject(req, res) {
  const { courseId } = req.params;
  const { name, order } = req.body;
  
  const course = await Course.findById(courseId);
  if (!course) return res.status(404).json({ message: 'Course not found' });

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const exists = await Subject.findOne({ course: courseId, slug });
  if (exists) return res.status(409).json({ message: 'Subject with this slug already exists for this course' });

  const subject = await Subject.create({
    name,
    slug,
    course: courseId,
    order: order || 0
  });

  res.status(201).json({ data: subject });
}

export async function updateSubject(req, res) {
  const { subjectId } = req.params;
  const { name, order } = req.body;

  const update = {};
  if (name !== undefined) {
    update.name = name;
    update.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  if (order !== undefined) update.order = order;

  const subject = await Subject.findByIdAndUpdate(subjectId, update, { new: true, runValidators: true });
  if (!subject) return res.status(404).json({ message: 'Subject not found' });

  res.json({ data: subject });
}

export async function deleteSubject(req, res) {
  const { subjectId } = req.params;

  const subject = await Subject.findById(subjectId);
  if (!subject) return res.status(404).json({ message: 'Subject not found' });

  // Find all pdfs for this subject
  const pdfs = await PdfMaterial.find({ subject: subjectId });

  // Delete pdfs from S3
  for (const pdf of pdfs) {
    if (pdf.s3Key) {
      await deletePdfFromS3(pdf.s3Key);
    }
  }

  // Delete pdfs from DB
  await PdfMaterial.deleteMany({ subject: subjectId });

  // Delete subject
  await Subject.findByIdAndDelete(subjectId);

  res.json({ message: 'Subject and related pdfs deleted successfully' });
}
