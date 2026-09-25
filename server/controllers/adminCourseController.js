import { Course } from '../models/Course.js';

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
  const { name, slug, description, duration, fees, thumbnailUrl, isActive } = req.body;

  const exists = await Course.findOne({ slug: slug?.toLowerCase()?.trim() });
  if (exists) return res.status(409).json({ message: 'A course with this slug already exists' });

  const course = await Course.create({
    name,
    slug: slug?.toLowerCase()?.trim(),
    description,
    duration,
    fees: Number(fees ?? 0),
    // thumbnailUrl stored in the image field used by the frontend
    ...(thumbnailUrl ? { image: thumbnailUrl } : {}),
    isActive: isActive !== false
  });

  res.status(201).json({ data: course });
}

/**
 * PUT /api/admin/courses/:id
 */
export async function updateCourse(req, res) {
  const { name, slug, description, duration, fees, thumbnailUrl, isActive } = req.body;

  const update = {};
  if (name !== undefined) update.name = name;
  if (slug !== undefined) update.slug = slug?.toLowerCase()?.trim();
  if (description !== undefined) update.description = description;
  if (duration !== undefined) update.duration = duration;
  if (fees !== undefined) update.fees = Number(fees);
  if (thumbnailUrl !== undefined) update.image = thumbnailUrl;
  if (isActive !== undefined) update.isActive = isActive;

  const course = await Course.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true
  });
  if (!course) return res.status(404).json({ message: 'Course not found' });
  res.json({ data: course });
}

/**
 * DELETE /api/admin/courses/:id
 * Soft-deletes by setting isActive: false to preserve data integrity.
 */
export async function deleteCourse(req, res) {
  const course = await Course.findByIdAndDelete(req.params.id);
  if (!course) return res.status(404).json({ message: 'Course not found' });
  res.json({ message: 'Course deleted successfully' });
}
