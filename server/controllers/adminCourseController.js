import { Course } from '../models/Course.js';
import { Subject } from '../models/Subject.js';
import { PdfMaterial } from '../models/PdfMaterial.js';
import { deletePdfFromS3 } from '../services/s3Service.js';

/**
 * GET /api/admin/courses
 */
export async function listCourses(_req, res) {
  const courses = await Course.find().sort({ createdAt: -1 });
  res.json({ data: courses });
}

/**
 * GET /api/admin/courses/:id
 */
export async function getCourse(req, res) {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ message: 'Course not found' });
  res.json({ data: course });
}

/**
 * POST /api/admin/courses
 */
export async function createCourse(req, res) {
  const { name, title, slug, description, duration, fees, price, thumbnailUrl, image, isActive } = req.body;
  const courseName = (name || title)?.trim();
  const courseSlug = (slug || courseName?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))?.trim();
  const courseFees = Number(fees !== undefined ? fees : price ?? 0);
  const courseImage = (thumbnailUrl || image)?.trim();

  const exists = await Course.findOne({ slug: courseSlug });
  if (exists) return res.status(409).json({ message: 'A course with this slug already exists' });

  const course = await Course.create({
    name: courseName,
    slug: courseSlug,
    description,
    duration,
    fees: courseFees,
    ...(courseImage ? { image: courseImage } : {}),
    isActive: isActive !== false
  });

  res.status(201).json({ data: course });
}

/**
 * PUT /api/admin/courses/:id
 */
export async function updateCourse(req, res) {
  const { name, title, slug, description, duration, fees, price, thumbnailUrl, image, isActive } = req.body;

  const update = {};
  if (name !== undefined || title !== undefined) update.name = (name || title)?.trim();
  if (slug !== undefined) update.slug = slug?.toLowerCase()?.trim();
  if (description !== undefined) update.description = description;
  if (duration !== undefined) update.duration = duration;
  if (fees !== undefined || price !== undefined) update.fees = Number(fees !== undefined ? fees : price);
  if (thumbnailUrl !== undefined || image !== undefined) update.image = (thumbnailUrl || image);
  if (isActive !== undefined) update.isActive = isActive;

  const course = await Course.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true
  });
  if (!course) return res.status(404).json({ message: 'Course not found' });
  res.json({ data: course });
}

export async function deleteCourse(req, res) {

  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ message: 'Course not found' });

  // Find all subjects for this course
  const subjects = await Subject.find({ course: course._id });
  const subjectIds = subjects.map(s => s._id);

  // Find all pdfs for these subjects
  const pdfs = await PdfMaterial.find({ subject: { $in: subjectIds } });

  // Delete pdfs from S3
  for (const pdf of pdfs) {
    if (pdf.s3Key) {
      await deletePdfFromS3(pdf.s3Key);
    }
  }

  // Delete pdfs and subjects from DB
  await PdfMaterial.deleteMany({ subject: { $in: subjectIds } });
  await Subject.deleteMany({ course: course._id });

  // Delete course
  await Course.findByIdAndDelete(course._id);

  res.json({ message: 'Course and related subjects/pdfs deleted successfully' });
}
